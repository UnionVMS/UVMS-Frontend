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
var rolesModule = angular.module('roles');

rolesModule.controller('rolesListCtrl', ['$translate', '$scope', '$log', 'refData', '$stateParams', '$state', 'getApplications', 'rolesServices', 'userService','applicationNames',
    function ($translate, $scope, $log, refData, $stateParams, $state, getApplications, rolesServices, userService, applicationNames) {
        $scope.criteria = {};
        $scope.sort = {
            sortColumn: $stateParams.sortColumn || 'name', // Default Sort.
            sortDirection: $stateParams.sortDirection || 'asc'
        };

        $scope.checkAccess = function(feature) {
        	return userService.isAllowed(feature,"USM",true);
        };

        $scope.showPagination = true;

        $scope.statusList = refData.statusesSearchDropDown;
        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found.";

		$scope.toolTipsDelay = refData.toolTipsDelay;

        // List Of Applications...
        var applicationsDropDown = [];
        angular.forEach(applicationNames, function (item) {
            var application = {};
            application.label = item;
            application.value = item;
            applicationsDropDown.push(application);
        });
        $scope.applicationsList = applicationsDropDown;

        // Retrieve roles. This method is executed by the pagination directive whenever the current page is changed
        // (also true for the initial loading).
        $scope.roleList = [];
        $scope.getPage = function(currentPage) {
            $scope.criteria = {
                role: $stateParams.role || '',
                application: $stateParams.application || '',
                status: $stateParams.status || 'all'
            };
            var criteria = $scope.criteria;
            criteria.offset = (currentPage - 1)  * $scope.paginationConfig.itemsPerPage;
            criteria.limit = $scope.paginationConfig.itemsPerPage;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;
            rolesServices.getRoles(criteria).then(
                function (response) {
                    $scope.roleList = response.roles;

                 if (!_.isUndefined($scope.roleList)) {
                    $scope.displayedRoles = [].concat($scope.roleList);
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

        $scope.searchRole = function (criteria) {
            // replace null with empty string because null breaks the stateParam application
            if(_.isNull(criteria.application) || _.isEqual("", criteria.application)){
                $scope.criteria.application = "";
            }
            $scope.paginationConfig.currentPage = 0;
            criteria.offset = 0;
            rolesServices.searchRoles(criteria).then(
                function (response) {
                    $scope.roleList = response.roles;
                    if (!_.isUndefined($scope.roleList)) {
                        $scope.displayedRoles = [].concat($scope.roleList);
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
        $scope.changeSorting = function(column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                if(sort.sortDirection === 'desc'){
                    sort.sortDirection = 'asc';
                }else if (sort.sortDirection === 'asc'){
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

        $scope.sortIcon = function(column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ?'fa-sort-desc':'fa-sort-asc';
            }
            return 'fa-sort';
        };

        // change url parameters
        var changeUrlParams = function () {
            $state.transitionTo($state.current, {
                    page: $scope.paginationConfig.currentPage,
                    sortColumn: $scope.sort.sortColumn,
                    sortDirection: $scope.sort.sortDirection,
                    role: $scope.criteria.role,
                    application: $scope.criteria.application,
                    status: $scope.criteria.status,
                    roleId: $state.params.roleId
                },
                {notify: false});
        };

        $scope.resetForm = function () {
            $scope.sort.sortColumn = 'name';
            $scope.sort.sortDirection = 'asc';
            $scope.criteria.role = '';
            $scope.criteria.status = refData.statusesDropDown[0].value;
            $scope.criteria.application = "";
            $scope.searchRole($scope.criteria);
        };


        $scope.paginationConfig =
        {
            currentPage: '',
            pageCount: '',
            totalItems: '',
            itemsPerPage: 8
        };

    }]);

rolesModule.controller('roleDetailsCtrl', ['$scope', '$stateParams', '$log', 'rolesServices', 'applicationsService', 'permissionServices', 'userService',
    function ($scope, $stateParams, $log, rolesServices, applicationsService, permissionServices, userService) {

    $scope.checkAccess = function(feature) {
    	return userService.isAllowed(feature,"USM",true);
    };

        $scope.itemsByPage = 10;
        $scope.emptyResult = true;

        rolesServices.getRoleDetails($stateParams.roleId).then(
            function (response) {
                $scope.roleDetails = response.roleDetails;
                if (_.size($scope.roleDetails.features) !== 0) {
                    $scope.displayedPermissions = [].concat($scope.roleDetails.features);
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
            },
            function (error) {
                $log.log("error");
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

rolesModule.controller('manageRoleCtrl', ['$scope', '$uibModal', '$log', 'rolesServices', 'userService',
    function ($scope, $uibModal, $log, rolesServices, userService) {

    $scope.checkAccess = function(feature) {
    	return userService.isAllowed(feature,"USM",true);
    };

        $scope.manageRole = function (mode, role) {
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/roles/partial/manageRole.html',
                controller: 'rolesModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    role: function () {
                        return angular.copy(role);
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedRole) {
                // Update the model (role)
                if (mode === 'edit') {
                    angular.copy(returnedRole, role);
                }
                // Remove the deleted role from the list
                if (mode === 'delete') {
                    var deleteIndex = $scope.roleList.indexOf(role);
                    $scope.roleList.splice(deleteIndex, 1);
                    $scope.displayedRoles = [].concat($scope.roleList);
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

    }]);

rolesModule.controller('rolesModalInstanceCtrl', ['$scope', '$uibModalInstance', '$log', '$timeout', '$location', 'refData', 'getApplications',
    'rolesServices', 'mode', 'role', '$stateParams',
    function ($scope, $uibModalInstance, $log, $timeout, $location, refData, getApplications, rolesServices, mode, role, $stateParams) {
        var confirmCreate = false;
        $scope.mode = mode;
        $scope.actionMessage = "";
        $scope.selectedStatus = "";
        $scope.organisation = {};
        $scope.roleCreated = false;
        $scope.showConfirmation = false;

        // $log.log(role);
        if (!_.isEmpty(role)) {
            $scope.role = role;
        } else {
            $scope.role = {status: 'E'};
        }
        // status dropdown
        $scope.statusList = refData.statusesEnDis;

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

        $scope.saveUpdateDelete = function (role) {
            //$log.log(role);
            if (mode === 'new') {
                rolesServices.createRole(role).then(
                    function (response) {
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "New Role created";
                        // Close modal by passing the new user to update the table
                        $scope.newRole = role;
                        $scope.roleCreated = true;
                        $timeout(function () {
                            $uibModalInstance.close($scope.newRole);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            }
            if (mode === 'edit') {
                if (role.activeUsers === 0 || $scope.showConfirmation) {
                    // do not update features from edit role buttons
                    role.features = [];
                    role.updateFeatures = false;
                    rolesServices.updateRole(role).then(
                        function (response) {
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Role Changes Saved";
                            // Close modal by passing the new user to update the table
                            $scope.newRole = response.newRole;
                            $scope.roleCreated = true;
                            $timeout(function () {
                                $uibModalInstance.close($scope.newRole);
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
                    $scope.actionMessage = "<strong>Warning: </strong>This role is assigned to " + role.activeUsers + " active user(s). Saving this change may have important impact!";
                }
            }
            if (mode === 'delete') {
                if (role.activeUsers === 0 || $scope.showConfirmation) {
                    rolesServices.deleteRole(role).then(
                        function (response) {
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Role deleted";
                            // Close modal by passing the new user to update the table
                            $scope.newRole = role;
                            $scope.roleCreated = true;
                            $timeout(function () {
                                $uibModalInstance.close($scope.newRole);
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
                    $scope.actionMessage = "<strong>Warning: </strong>This role is assigned to " + role.activeUsers + " active user(s). Saving this change may have important impact! The user contexts with that role will be deleted";
                }
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }]);

rolesModule.controller('managePermissionCtrl', ['$scope', '$uibModal', '$log',
    function ($scope, $uibModal, $log, $stateParams) {

        $scope.managePermissions = function (roleDetails) {
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/roles/partial/managePermission.html',
                controller: 'permissionModalInstanceCtrl',
                resolve: {
                    roleDetails: function () {
                        return roleDetails;
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedRoleDetails) {
                //$scope.roleDetails = returnedRoleDetails;
                if (_.size(returnedRoleDetails.features) > 0) {
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
                $scope.roleDetails.features = returnedRoleDetails.features;
                $scope.displayedPermissions = [].concat($scope.roleDetails.features);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

    }]);

rolesModule.controller('permissionModalInstanceCtrl', ['$scope', '$uibModalInstance', '$log', '$timeout', '$location', 'refData', 'getApplications',
    'permissionServices', 'roleDetails', '$stateParams', 'applicationsService', 'filterFilter', 'rolesServices', 'rolesCache',
    function ($scope, $uibModalInstance, $log, $timeout, $location, refData, getApplications, permissionServices, roleDetails, $stateParams,
              applicationsService, filterFilter, rolesServices, rolesCache) {


        $scope.sort = {
            sortColumn: $stateParams.sortColumn || 'name', // Default Sort.
            sortDirection: $stateParams.sortDirection || 'asc'
        };
        $scope.header = {
            selectAll: false
        };
        $scope.emptyResult = true;
        $scope.isDataLoading = true;
        $scope.loadingMessage = "Loading... taking some time";

        $scope.actionMessage = "";
        $scope.permissionsSaved = false;
        $scope.showConfirmation = false;

        // List Of Applications...
        getApplications.get().then(
            function (response) {
                $scope.applicationsList = response.applications;
            },
            function (error) {
                $scope.applicationsList = [error];
            }
        );
        // List Of Groups...
        permissionServices.getGroups().then(
            function (response) {
                //$log.log(response);
                $scope.groupsList = response.groups;
            },
            function (error) {
                $scope.groupsList = [error];
            }
        );

        // Permission list... take it from cache if exist
        applicationsService.getAllFeatures().then(
            function (response) {
                $scope.isDataLoading = false;
                $scope.permissionsList = response.features;

                if (_.size($scope.permissionsList) !== 0) {
                    var numberOfChecks = 0;
                    angular.forEach($scope.permissionsList, function (permission) {
                        //var roles = permission.roles;
                        var selectedFeatures = roleDetails.features;
                        var isAttachedToTheRole = _.find(selectedFeatures, function (selectedFeature) {
                            if (_.isEqual(selectedFeature.featureId, permission.featureId)) {
                                return true;
                            }
                        });
                        if (isAttachedToTheRole || _.contains($scope.selection, permission.featureId)) {
                            numberOfChecks++;
                            permission.selected = true;
                        } else {
                            permission.selected = false;
                        }
                    });
                    // Select all checkbox should be checked if all the permissions are checked
                    if (_.isEqual(_.size($scope.permissionsList), numberOfChecks)) {
                        $scope.header.selectAll = true;
                    } else {
                        $scope.header.selectAll = false;
                    }
                    $scope.displayedPermissions = [].concat($scope.permissionsList);
                    // Collect the selected features
                    $scope.selection = filterFilter($scope.displayedPermissions, {selected: true}).map(function (permission) {
                        return permission.featureId;
                    });
                    $scope.emptyResult = false;
                    // cache the list
                    /*
                     if (_.isUndefined(rolesCache.get('permissionsList'))) {
                     rolesCache.put('permissionsList', $scope.permissionsList);
                     }
                     */
                } else {
                    $scope.emptyResult = true;
                }
            },
            function (error) {
                $scope.loadingMessage = error;
            });

        $scope.$watch('displayedPermissions|filter:{selected:true}', function (newValue) {
            if (!_.isUndefined(newValue) && !_.isNull(newValue)) {
                $scope.addSelections = newValue.map(function (permission) {
                    return permission.featureId;
                });
                $scope.selection = _.uniq($scope.selection.concat($scope.addSelections));
            }
        }, true);

        $scope.$watch('displayedPermissions|filter:{selected:false}', function (newValue) {
            if (!_.isUndefined(newValue) && !_.isNull(newValue)) {
                $scope.removeSelections = newValue.map(function (permission) {
                    return permission.featureId;
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
            angular.forEach($scope.displayedPermissions, function (permission) {
                permission.selected = isAllSelected;
            });
        };

        // Check individual checkbox behaviour
        $scope.toggleItem = function (selected) {
            if (!selected) {
                $scope.header.selectAll = false;
            } else {
                var findUnselected = _.find($scope.displayedPermissions,
                    function (permission) {
                        if (!permission.selected) {
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

		// Reset Filter permission
        $scope.resetForm = function (criteria) {
			if(criteria !== undefined) {
				criteria.application = null;
				criteria.group = null;
				criteria.sortColumn = 'name';
				criteria.sortDirection = 'asc';
				$scope.filterPermissions(criteria);
			} else {
				var criteriaEmpty = {};
				criteriaEmpty.application = null;
				criteriaEmpty.group = null;
				$scope.filterPermissions(criteriaEmpty);
			}
        };

        // Filter permission
        $scope.filterPermissions = function (criteria) {
            applicationsService.getPermissionByCriteria(criteria).then(
                function (response) {
                    $scope.permissionsList = response.features;
                    if (_.size($scope.permissionsList) !== 0) {
                        var numberOfChecks = 0;
                        angular.forEach($scope.permissionsList, function (permission) {
                            //var roles = permission.roles;
                            var selectedFeatures = roleDetails.features;
                            var isAttachedToTheRole = _.find(selectedFeatures, function (selectedFeature) {
                                if (_.isEqual(selectedFeature.featureId, permission.featureId)) {
                                    return true;
                                }
                            });
                            // keep checked the permissions attached to a role and the permissions selected from previous filtering
                            if (isAttachedToTheRole || _.contains($scope.selection, permission.featureId)) {
                                numberOfChecks++;
                                permission.selected = true;
                            } else {
                                permission.selected = false;
                            }
                        });
                        // Select all checkbox should be checked if all the permissions are checked
                        if (_.isEqual(_.size($scope.permissionsList), numberOfChecks)) {
                            $scope.header.selectAll = true;
                        } else {
                            $scope.header.selectAll = false;
                        }
                        $scope.displayedPermissions = [].concat($scope.permissionsList);
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

        $scope.saveRolePermissions = function () {

            if (roleDetails.activeUsers === 0 || $scope.showConfirmation) {
            	roleDetails.features = $scope.selection;
                roleDetails.roleId = $stateParams.roleId;

                rolesServices.updateRole(roleDetails).then(
                    function (response) {
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "Role Changes Saved";
                        // Close modal by passing the new user to update the table
                        $scope.newRole = response.newRole;
                        $scope.permissionsSaved = true;
                        $timeout(function () {
                            $uibModalInstance.close($scope.newRole);
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
                $scope.actionMessage = "<strong>Warning: </strong>This role is assigned to " + roleDetails.activeUsers + " active user(s). Saving this change may have important impact!";
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }]);
