/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
var scopesModule = angular.module('scopes');

scopesModule.controller('scopesListCtrl', ['$log', '$scope', '$stateParams', '$state', 'refData', 'getApplications', 'scopeServices', 'userService', 'applicationNames',
    function ($log, $scope, $stateParams, $state, refData, getApplications, scopeServices, userService, applicationNames) {
        $scope.criteria = {};
        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
	    };

        $scope.sort = {
            sortColumn: $stateParams.sortColumn || 'name', // Default Sort.
            sortDirection: $stateParams.sortDirection || 'asc'
        };

        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.showPagination = true;
        $scope.emptyResultMessage = "No results found.";
        // statuses...
        $scope.statusList = refData.statusesSearchDropDown;
        // applications...
        var applicationsDropDown = [];
        angular.forEach(applicationNames, function (item) {
            var application = {};
            application.label = item;
            application.value = item;
            applicationsDropDown.push(application);
        });
        $scope.applicationsList = applicationsDropDown;

        // change url parameters
        var changeUrlParams = function () {
            $state.transitionTo($state.current, {
                    page: $scope.paginationConfig.currentPage,
                    sortColumn: $scope.sort.sortColumn,
                    sortDirection: $scope.sort.sortDirection,
                    name: $scope.criteria.name,
                    application: $scope.criteria.application,
                    status: $scope.criteria.status,
                    scopeId: $state.params.scopeId
                },
                {notify: false});
        };

        // this method is executed by the pagination directive whenever the current page is changed
        // (also true for the initial loading).
        $scope.getPage = function (currentPage) {
            $scope.criteria = {
                name: $stateParams.name || '',
                application: $stateParams.application || '',
                status: $stateParams.status || 'all'
            };
            var criteria = $scope.criteria;
            criteria.offset = (currentPage - 1) * $scope.paginationConfig.itemsPerPage;
            criteria.limit = $scope.paginationConfig.itemsPerPage;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;


            scopeServices.getScopes(criteria).then(
                function (response) {
                    $scope.scopeList = response.scopes;

                if (!_.isUndefined($scope.scopeList)) {
                    $scope.displayedScopes = [].concat($scope.scopeList);
                    $scope.isDataLoading = false;
                    $scope.emptyResult = false;
                    $scope.paginationConfig.totalItems = response.total;
                    $scope.paginationConfig.pageCount = Math.ceil($scope.paginationConfig.totalItems / $scope.paginationConfig.itemsPerPage);
                } else {
                    $scope.emptyResult = true;
                    $scope.isDataLoading = false;
                    $scope.showPagination = false;
                }
                    changeUrlParams();
                },
                function (error) {
                    $scope.isDataLoading = false;
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );
        };

        $scope.searchScope = function (criteria) {
            // replace null with empty string because null breaks the stateParam application
            if (_.isNull(criteria.application)) {
                $scope.criteria.application = "";
            }
            $scope.paginationConfig.currentPage = 0;
            criteria.offset = 0;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;
            scopeServices.searchScopes(criteria).then(
                function (response) {
                    $scope.scopeList = response.scopes;
                    if (!_.isUndefined($scope.scopeList)) {
                        $scope.displayedScopes = [].concat($scope.scopeList);
                        $scope.emptyResult = false;
                        $scope.showPagination = true;
                        $scope.paginationConfig.totalItems = response.total;
                        $scope.paginationConfig.pageCount = Math.ceil($scope.paginationConfig.totalItems / $scope.paginationConfig.itemsPerPage);
                        $scope.paginationConfig.currentPage = 1;
                    } else {
                        $scope.emptyResult = true;
                        $scope.isDataLoading = false;
                        $scope.showPagination = false;
                    }
                    changeUrlParams();
                },
                function (error) {
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );

        };

        // Sorting columns
        $scope.changeSorting = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                if (sort.sortDirection === 'desc') {
                    sort.sortDirection = 'asc';
                } else if (sort.sortDirection === 'asc') {
                    sort.sortDirection = 'desc';
                }
            } else {
                sort.sortColumn = column;
                sort.sortDirection = 'asc';
            }
            $scope.sort.sortColumn = column;
            $scope.sort.sortDirection = sort.sortDirection;
            $scope.getPage($scope.paginationConfig.currentPage);
        };

        $scope.sortIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };


        $scope.resetForm = function () {
            $scope.sort.sortColumn = 'name';
            $scope.sort.sortDirection = 'asc';
            $scope.criteria.name = '';
            $scope.criteria.status = refData.statuses[0];
            $scope.criteria.application = '';
            $scope.searchScope($scope.criteria);
        };

        // configuration for the pagination directive
        $scope.paginationConfig =
        {
            currentPage: '',
            pageCount: '',
            totalItems: '',
            itemsPerPage: 8
        };

    }]);

scopesModule.controller('scopeDetailsCtrl', ['$log', '$scope', '$stateParams', 'scopeServices', 'userService',
    function ($log, $scope, $stateParams, scopeServices, userService) {
        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
	    };

        $scope.emptyResultMessage = "No datasets found. Please try to search again.";
        $scope.itemsByPage = 10;
        $scope.emptyResult = true;
        $scope.status = {};
        $scope.scopeId = $stateParams.scopeId;

        scopeServices.getScopeDetails($scope.scopeId).then(
            function (response) {
                $scope.scopeDetails = response.scopeDetails;
                if (_.isEqual($scope.scopeDetails.status, 'E')) {
                    $scope.status.class = 'label label-success';
                } else if (_.isEqual($scope.scopeDetails.status, 'D')) {
                    $scope.status.class = 'label label-danger';
                }
                if (_.size($scope.scopeDetails.dataSets) !== 0) {
                    $scope.displayedDatasets = [].concat($scope.scopeDetails.dataSets);
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
            },
            function (error) {
                $scope.emptyResult = true;
                $scope.emptyResultMessage = error;
            }
        );

        $scope.sort = {
            sortColumn: 'name', // Default Sort.
            sortDirection: 'asc'
        };

        $scope.changeSorting = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                if (sort.sortDirection === 'desc') {
                    sort.sortDirection = 'asc';
                } else if (sort.sortDirection === 'asc') {
                    sort.sortDirection = 'desc';
                }
            } else {
                sort.sortColumn = column;
                sort.sortDirection = 'asc';
            }
            $scope.sort.sortColumn = column;
            $scope.sort.sortDirection = sort.sortDirection;
            //$scope.getPage($scope.paginationConfig.currentPage);
        };

        $scope.sortIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };
    }]);

scopesModule.controller('manageScopeCtrl', ['$log', '$scope', '$modal', '$stateParams', 'userService', 'scopeServices',
    function ($log, $scope, $modal, $stateParams, userService, scopeServices) {

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
	    };

        $scope.manageScope = function (mode, scope) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/scopes/partial/manageScope.html',
                controller: 'scopesModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    scopeItem: function () {
                        return scopeServices.getScopeDetails(scope.scopeId).then(
                            function (response) {
                                return response.scopeDetails;
                            }
                        );
                    }
                }
            });

            modalInstance.result.then(function (returnedScope) {
                if (mode === 'new') {
                    angular.copy(returnedScope, scope);
                    $scope.scopeList.push(returnedScope);
                    $scope.displayedScopes = [].concat($scope.scopeList);
                }
                if (mode === 'edit') {
                    angular.copy(returnedScope, scope);
                    if (!_.isUndefined($stateParams.scopeId)) {
                        if (_.isEqual(returnedScope.status, 'E')) {
                            $scope.status.class = 'label label-success';
                        } else if (_.isEqual(returnedScope.status, 'D')) {
                            $scope.status.class = 'label label-danger';
                        }
                    }
                }
                // Remove the deleted role from the list
                if (mode === 'delete') {
                    var deleteIndex = $scope.scopeList.indexOf(scope);
                    $scope.scopeList.splice(deleteIndex, 1);
                    $scope.displayedScopes = [].concat($scope.scopeList);
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

scopesModule.controller('scopesModalInstanceCtrl', ['$scope', '$modalInstance', '$log', '$timeout', '$location', 'refData', 'getApplications',
    'scopeServices', 'mode', 'scopeItem',
    function ($scope, $modalInstance, $log, $timeout, $location, refData, getApplications, scopeServices, mode, scopeItem) {
        var confirmCreate = false;
        $scope.mode = mode;
        $scope.actionMessage = "";
        $scope.selectedStatus = "";
        $scope.organisation = {};
        $scope.scopeCreated = false;
        $scope.showConfirmation = false;
        $scope.formDisabled = false;

        // status dropdown
        $scope.statusList = refData.statusesEnDis;

        if (mode === 'new') {
            $scope.scope = {
                status: $scope.statusList[0]
            };
        } else {
        if (!_.isEmpty(scopeItem)) {
            $scope.scope = scopeItem;
        }
        }


        // application dropdown
        getApplications.get().then(
            function (response) {
                $scope.applicationsList = response.applications;
            },
            function (error) {
                $scope.messageDivClass = "alert alert-danger";
                $scope.actionMessage = error;
            }
        );

        //activeFrom date configuration
        $scope.activeFromConfig =
        {
            id: 'activeFrom',
            name: 'activeFrom',
            dataModel: 'scope.activeFrom',
            defaultValue: $scope.scope.activeFrom,
            isDefaultValueWatched: true,
            isRequired: true
        };
        // activeTo date configuration
        $scope.activeToConfig =
        {
            id: 'activeTo',
            name: 'activeTo',
            dataModel: 'scope.activeTo',
            defaultValue: $scope.scope.activeTo,
            isDefaultValueWatched: true,
            isRequired: true
        };
        //dataFrom date configuration
        $scope.dataFromConfig =
        {
            id: 'dataFrom',
            name: 'dataFrom',
            dataModel: 'scope.dataFrom',
            defaultValue: $scope.scope.dataFrom,
            isDefaultValueWatched: true,
            isRequired: false
        };
        // dataTo date configuration
        $scope.dataToConfig =
        {
            id: 'dataTo',
            name: 'dataTo',
            dataModel: 'scope.dataTo',
            defaultValue: $scope.scope.dataTo,
            isDefaultValueWatched: true,
            isRequired: false

        };

        if (_.isEqual(mode, "delete")) {
            $scope.formDisabled = true;
            $scope.activeFromConfig.isDisabled = $scope.formDisabled;
            $scope.activeToConfig.isDisabled = $scope.formDisabled;
            $scope.dataFromConfig.isDisabled = $scope.formDisabled;
            $scope.dataToConfig.isDisabled = $scope.formDisabled;
        }

        // use this watches to check the existence of the From/To dates
        $scope.$watch('scope.activeFrom', function (newValue, oldValue) {
            if (!_.isUndefined(oldValue) || !_.isUndefined(newValue)) {
                $scope.showActiveFromError = !(!_.isUndefined(newValue) && !_.isNull(newValue));
            }
        }, true);
        $scope.$watch('scope.activeTo', function (newValue, oldValue) {
            if (!_.isUndefined(oldValue) || !_.isUndefined(newValue)) {
                $scope.showActiveToError = !(!_.isUndefined(newValue) && !_.isNull(newValue));
            }
        }, true);

        // Firefox marks as invalid date the one coming from the datepicker.
        // Try to build a javascript date from the input.
        var trasformDate = function (date) {
            var dateToken = date.split("-");
            var days = dateToken[2].split(" ")[0];
            return dateToken[0] + "-" + dateToken[1] + "-" + days;
        };

        $scope.saveUpdateDelete = function (scope) {
            scope.activeFrom = new Date(trasformDate(scope.activeFrom));
            scope.activeTo = new Date(trasformDate(scope.activeTo));
            scope.dataFrom = !_.isNull(scope.dataFrom) && !_.isUndefined(scope.dataFrom) ? new Date(trasformDate(scope.dataFrom)) : null;
            scope.dataTo = !_.isNull(scope.dataTo) && !_.isUndefined(scope.dataTo) ? new Date(trasformDate(scope.dataTo)) : null;
            //Format dates
            scope.dataFrom = scope.dataFrom ? moment.utc(scope.dataFrom).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null;
            scope.dataTo = scope.dataTo ? moment.utc(scope.dataTo).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null;
            scope.activeFrom = scope.activeFrom ? moment.utc(scope.activeFrom).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null;
            scope.activeTo = scope.activeTo ? moment.utc(scope.activeTo).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null;
            if (mode === 'new') {
                // remove unnecessary attributes total, result when creating a scope
                delete scope.total;
                delete scope.results;
                scopeServices.createScope(scope).then(
                    function (response) {
                        $scope.newScope = response.newScope;
                        $scope.scopeCreated = true;
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "New Scope created";
                        $timeout(function () {
                            $modalInstance.close($scope.newScope);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            }
            if (mode === 'edit') {
                if (scope.activeUsers === 0 || $scope.showConfirmation) {
                    if (_.isEqual(scope.dataFrom, "Invalid date")) {
                        scope.dataFrom = null;
                    }
                    if (_.isEqual(scope.dataTo, "Invalid date")) {
                        scope.dataTo = null;
                    }
                    scope.updateDatasets = false;
                    scopeServices.updateScope(scope).then(
                        function (response) {
                            $scope.updatedScope = response.updatedScope;
                            $scope.scopeCreated = true;
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Scope Changes Saved";
                            $timeout(function () {
                                $modalInstance.close($scope.updatedScope);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                } else {
                    $scope.showConfirmation = true;
                    $scope.messageDivClass = "alert alert-warning";
                    $scope.actionMessage = "<strong>Warning: </strong>This scope is assigned to " + scope.activeUsers + " active user(s). Saving this change may have important impact!";
                }
            }
            if (mode === 'delete') {
                if ((_.isUndefined(scope.activeUsers) || scope.activeUsers === 0) || $scope.showConfirmation) {
                    scopeServices.deleteScope(scope.scopeId).then(
                        function (response) {
                            $scope.deletedScope = scope;
                            $scope.scopeCreated = true;
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Scope deleted";
                            $timeout(function () {
                                $modalInstance.close($scope.deletedScope);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                } else {
                    $scope.showConfirmation = true;
                    $scope.messageDivClass = "alert alert-warning";
                    $scope.actionMessage = "<strong>Warning: </strong>This scope is assigned to " + scope.activeUsers + " active user(s). Saving this change may have important impact! The user contexts with that scope will be deleted";
                }
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }]);

scopesModule.controller('manageDatasetsCtrl', ['$log', '$scope', '$modal',
    function ($log, $scope, $modal) {
        $scope.manageDatasets = function (scopeDetails) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/scopes/partial/manageDatasets.html',
                controller: 'datatsetsModalInstanceCtrl',
                resolve: {
                    scopeDetails: function () {
                        return scopeDetails;
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedScopeDetails) {
                if (_.size(returnedScopeDetails.dataSets) > 0) {
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
                $scope.scopeDetails.dataSets = returnedScopeDetails.dataSets;
                $scope.displayedDatasets = [].concat($scope.scopeDetails.dataSets);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

scopesModule.controller('datatsetsModalInstanceCtrl', ['$log', '$scope', '$modalInstance', '$stateParams', '$timeout', 'scopeDetails',
    'filterFilter', 'getApplications', 'scopeServices',
    function ($log, $scope, $modalInstance, $stateParams, $timeout, scopeDetails, filterFilter, getApplications, scopeServices) {
        $scope.header = {
            selectAll: false
        };
        $scope.emptyResult = true;
        $scope.isDataLoading = true;
        $scope.loadingMessage = "Loading... taking some time";

        $scope.actionMessage = "";
        $scope.datasetsSaved = false;
        $scope.showConfirmation = false;

        $log.log(scopeDetails);

        // List Of Applications...
        getApplications.get().then(
            function (response) {
                $scope.applicationsList = response.applications;
            },
            function (error) {
                $scope.applicationsList = [error];
            }
        );
        // List Of Categories...
        scopeServices.getCategories().then(
            function (response) {
                $scope.categoryList = response.categories;
            },
            function (error) {
                $scope.categoryList = [error];
            }
        );

        // datasets list...
        scopeServices.getAllDatasets().then(
            function (response) {
                $scope.isDataLoading = false;
                $scope.datasetsList = response.datasets;
                if (_.size($scope.datasetsList) !== 0) {
                    var numberOfChecks = 0;
                    angular.forEach($scope.datasetsList, function (dataset) {
                        //var scopes = dataset.scopes;
                        var selectedDatasets = scopeDetails.dataSets;
                        var isAttachedToTheScope = _.find(selectedDatasets, function (selectedDataset) {
                            if (_.isEqual(selectedDataset.datasetId, dataset.datasetId)) {
                                return true;
                            }
                        });
                        if (isAttachedToTheScope || _.contains($scope.selection, dataset.datasetId)) {
                            numberOfChecks++;
                            dataset.selected = true;
                        } else {
                            dataset.selected = false;
                        }
                    });
                    // Select all checkbox should be checked if all the permissions are checked
                    if (_.isEqual(_.size($scope.datasetsList), numberOfChecks)) {
                        $scope.header.selectAll = true;
                    } else {
                        $scope.header.selectAll = false;
                    }
                    $scope.displayedDatasets = [].concat($scope.datasetsList);
                    // Collect the selected features
                    $scope.selection = filterFilter($scope.displayedDatasets, {selected: true}).map(function (dataset) {
                        return dataset.datasetId;
                    });
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
            },
            function (error) {
                $scope.loadingMessage = error;
            });

        // add the selected items
        $scope.$watch('displayedDatasets|filter:{selected:true}', function (newValue) {
            if (!_.isUndefined(newValue) && !_.isNull(newValue)) {
                $scope.addSelections = newValue.map(function (dataset) {
                    return dataset.datasetId;
                });
                $scope.selection = _.uniq($scope.selection.concat($scope.addSelections));
            }
        }, true);

        // remove the unselected items
        $scope.$watch('displayedDatasets|filter:{selected:false}', function (newValue) {
            if (!_.isUndefined(newValue) && !_.isNull(newValue)) {
                $scope.removeSelections = newValue.map(function (dataset) {
                    return dataset.datasetId;
                });
                $scope.selection = _.difference($scope.selection, $scope.removeSelections);
            }
        }, true);

        // Check all behaviour
        $scope.toggleAll = function () {
            var isAllSelected = $scope.header.selectAll;
            if (isAllSelected) {
                $scope.header.selectAll = true;
            } else {
                $scope.header.selectAll = false;
            }
            angular.forEach($scope.displayedDatasets, function (dataset) {
                dataset.selected = isAllSelected;
            });
        };

        // Check individual checkbox behaviour
        $scope.toggleItem = function (selected) {
            if (!selected) {
                $scope.header.selectAll = false;
            } else {
                var findUnselected = _.find($scope.displayedDatasets,
                    function (dataset) {
                        if (!dataset.selected) {
                            return true;
                        }
                    });
                if (findUnselected) {
                    $scope.header.selectAll = false;
                } else {
                    $scope.header.selectAll = true;
                }
            }
        };

        $scope.filterDatasets = function (criteria) {
            scopeServices.searchDataset(criteria).then(
                function (response) {
                    $scope.datasetsList = response.datasets;
                    if (_.size($scope.datasetsList) !== 0) {
                        var numberOfChecks = 0;
                        angular.forEach($scope.datasetsList, function (dataset) {
                            //var scopes = dataset.scopes;
                            var selectedDatasets = scopeDetails.dataSets;
                            var isAttachedToTheScope = _.find(selectedDatasets, function (selectedDataset) {
                                if (_.isEqual(selectedDataset.datasetId, dataset.datasetId)) {
                                    return true;
                                }
                            });
                            // keep checked the datasets attached to a scope and the datasets selected from previous filtering
                            if (isAttachedToTheScope || _.contains($scope.selection, dataset.datasetId)) {
                                numberOfChecks++;
                                dataset.selected = true;
                            } else {
                                dataset.selected = false;
                            }
                        });
                        // Select all checkbox should be checked if all the permissions are checked
                        if (_.isEqual(_.size($scope.datasetsList), numberOfChecks)) {
                            $scope.header.selectAll = true;
                        } else {
                            $scope.header.selectAll = false;
                        }
                        $scope.displayedDatasets = [].concat($scope.datasetsList);
                        $scope.emptyResult = false;
                    } else {
                        $scope.emptyResult = true;
                        $scope.emptyResultMessage = "No results found.";
                    }
                },
                function (error) {
                    $log.log(error);
                }
            );
        };

        $scope.saveScopeDatasets = function () {
            $log.log($scope.selection);
            scopeDetails.dataSets = $scope.selection;
            scopeDetails.scopeId = $stateParams.scopeId;
            if (scopeDetails.activeUsers === 0 || $scope.showConfirmation) {
                scopeServices.updateScope(scopeDetails).then(
                    function (response) {
                        // Close modal by passing the new user to update the table
                        $scope.updatedScope = response.updatedScope;
                        $scope.datasetsSaved = true;
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "Scope Changes Saved";
                        $log.log($scope.updatedScope);
                        $timeout(function () {
                            $modalInstance.close($scope.updatedScope);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            } else {
                $scope.showConfirmation = true;
                $scope.messageDivClass = "alert alert-warning";
                $scope.actionMessage = "<strong>Warning: </strong>This scope is assigned to " + scopeDetails.activeUsers + " active user(s). Saving this change may have important impact!";
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);