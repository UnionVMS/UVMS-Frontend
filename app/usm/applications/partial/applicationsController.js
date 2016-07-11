/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
var applicationsModule = angular.module('applications');

applicationsModule.controller('applicationsListCtrl', ['$log', '$scope', '$state', '$stateParams', 'applicationsService', 'userService','applicationNames',
    function ($log, $scope, $state, $stateParams, applicationsService, userService, applicationNames) {

        var init = function () {
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

            var applicationsDropDown = [];
            angular.forEach(applicationNames, function(item){
                var application = {};
                application.label = item;
                application.value = item;
                applicationsDropDown.push(application);
            });
            $scope.parentList = applicationsDropDown;
        };
        init();

        // this method is executed by the pagination directive whenever the current page is changed
        // (also true for the initial loading).
        $scope.getPage = function (currentPage) {
                $scope.criteria = {
                    name: $state.params.name || '',
                    parent: $state.params.parent || ''
                };
                var criteria = $scope.criteria;
                criteria.offset = (currentPage - 1) * $scope.paginationConfig.itemsPerPage;
                criteria.limit = $scope.paginationConfig.itemsPerPage;
                criteria.sortColumn = $scope.sort.sortColumn;
                criteria.sortDirection = $scope.sort.sortDirection;

                applicationsService.getApplications(criteria).then(
                    function (response) {
                        $scope.applicationList = response.applications;

                        if (!_.isUndefined($scope.applicationList)) {
                            $scope.displayedApplications = [].concat($scope.applicationList);
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

        $scope.searchApplication = function (criteria) {
            // replace null with empty string because null breaks the stateParam application
            if (_.isNull(criteria.parent)) {
                $scope.criteria.parent = "";
            }
            $scope.paginationConfig.currentPage = 0;
            criteria.offset = 0;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;
            applicationsService.getApplications(criteria).then(
                function (response) {
                    $scope.applicationList = response.applications;
                    if (!_.isUndefined($scope.applicationList)) {
                        $scope.displayedApplications = [].concat($scope.applicationList);
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

        // change url parameters
        var changeUrlParams = function () {
            $state.transitionTo($state.current, {
                    page: $scope.paginationConfig.currentPage,
                    sortColumn: $scope.sort.sortColumn,
                    sortDirection: $scope.sort.sortDirection,
                    name: $scope.criteria.name,
                    parent: $scope.criteria.parent
                },
                {notify: false});
        };

        $scope.resetForm = function () {
            $scope.sort.sortColumn = 'name';
            $scope.sort.sortDirection = 'asc';
            $scope.criteria.name = '';
            $scope.criteria.parent = '';
            $scope.searchApplication($scope.criteria);
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

applicationsModule.controller('applicationDetailsCtrl', ['$log', '$scope', '$state', '$stateParams', 'applicationsService', 'userService',
    function ($log, $scope, $state, $stateParams, applicationsService, userService) {
        var init = function () {
            $scope.itemsByPage = 10;

            $scope.checkAccess = function (feature) {
                return userService.isAllowed(feature, "USM", true);
            };

            applicationsService.getApplicationDetails($stateParams.applicationName).then(
                function (response) {
                    $scope.applicationDetails = response.applicationDetails;

                    if (_.size($scope.applicationDetails.features) !== 0) {
                        $scope.displayedFeatures = [].concat($scope.applicationDetails.features);
                        $scope.emptyFeaturesResult = false;
                    } else {
                        $scope.emptyFeaturesResult = true;
                    }

                    if (_.size($scope.applicationDetails.datasets) !== 0) {
                        $scope.displayedDatasets = [].concat($scope.applicationDetails.datasets);
                        $scope.emptyDatasetsResult = false;
                    } else {
                        $scope.emptyDatasetsResult = true;
                    }

                    if (_.size($scope.applicationDetails.options) !== 0) {
                        $scope.displayedOptions = [].concat($scope.applicationDetails.options);
                        $scope.emptyOptionsResult = false;
                    } else {
                        $scope.emptyOptionsResult = true;
                    }

                },
                function (error) {

                }
            );
        };
        init();

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