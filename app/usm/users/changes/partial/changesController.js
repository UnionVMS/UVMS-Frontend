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
var changesModule = angular.module('changes');

changesModule.controller('changesListCtrl', ['$log', '$scope', '$modal', 'changesService', 'userService',
    function ($log, $scope, $modal, changesService, userService) {

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        $scope.isDataLoading = true;
        $scope.emptyResultMessage = "No results found.";
        $scope.itemsByPage = 10;
        $scope.emptyResult = true;

        changesService.findPendingContactDetails().then(
            function (response) {
                $scope.changesList = response.changes;
                if (_.size($scope.changesList) !== 0) {
                    $scope.displayedChanges = [].concat($scope.changesList);
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }
                $scope.isDataLoading = false;
            },
            function (error) {
                $log.log("error");
            }
        );

        $scope.manageChange = function (change) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/users/changes/partial/manageChange.html',
                controller: 'changesModalInstanceCtrl',
                resolve: {
                    change: function () {
                        return changesService.getPendingContactDetails(change.userName).then(
                            function (response) {
                                return response.change;
                            },
                            function (error) {
                                return [error];
                            }
                        );
                    },
                    oldValue: function () {
                        return changesService.getContactDetails(change.userName).then(
                            function (response) {
                                return response.contactDetails;
                            },
                            function (error) {
                                return [error];
                            }
                        );
                    }
                }
            });

            modalInstance.result.then(function () {
                var deleteIndex = $scope.changesList.indexOf(change);
                $scope.changesList.splice(deleteIndex, 1);
                $scope.displayedChanges = [].concat($scope.changesList);

            }, function () {

            });
        };
        $scope.sort = {
            sortColumn: 'userName', // Default Sort.
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

changesModule.controller('changesModalInstanceCtrl', ['$scope', '$log', '$modalInstance', '$timeout', 'changesService', 'change', 'oldValue',
    function ($scope, $log, $modalInstance, $timeout, changesService, change, oldValue) {

        $scope.oldValue = oldValue;
        $scope.newValue = change;

        $scope.approveChange = function (userName) {
            changesService.acceptPendingContactDetails(userName).then(
                function (response) {
                    $scope.messageDivClass = "alert alert-success";
                    $scope.actionMessage = "Changes Approved";
                    $scope.changesSaved = true;
                    $timeout(function () {
                        $modalInstance.close();
                    }, 2000);
                },
                function (error) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
        };

        $scope.rejectChange = function (userName) {
            changesService.rejectPendingContactDetails(userName).then(
                function (response) {
                    $scope.messageDivClass = "alert alert-success";
                    $scope.actionMessage = "Changes Rejected";
                    $scope.changesSaved = true;
                    $timeout(function () {
                        $modalInstance.close();
                    }, 2000);
                },
                function (error) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);