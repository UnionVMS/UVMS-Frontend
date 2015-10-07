var userPreferencesModule = angular.module('preferences');

userPreferencesModule.controller('userPreferencesCtrl', ['$scope', '$stateParams','$modal',
    function ($scope, $stateParams, $modal) {
        $scope.manageUserPreference = function (mode, userPreference) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                templateUrl: 'usm/users/preferences/partial/manageUserPreferences.html',
                controller: 'userPreferencesModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    userPreference: function () {
                        return angular.copy(userPreference);
                    }
                }
            });

            modalInstance.result.then(function (returnedUserPreference) {
                if (mode === 'new') {
                }
                if (mode === 'edit') {
                }
                if (mode === 'delete') {
                }
            }, function () {
            });
        };
        $scope.sort = {
            sortColumn: 'optionName', // Default Sort.
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
    }
]);

userPreferencesModule.controller('userPreferencesModalInstanceCtrl', ['$log', '$scope',
    function ($log, $scope) {


    }]);
