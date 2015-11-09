var userPreferencesModule = angular.module('preferences');

userPreferencesModule.controller('userPreferencesCtrl', ['$scope', '$stateParams','$modal','userService','userPreferencesService',
    function ($scope, $stateParams, $modal, userService,userPreferencesService) {

        $scope.manageUserPreference = function (mode, userPreference) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
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


       // $scope.search = { groupName: '' };

        // List Of options
        userPreferencesService.getUserPreferences($stateParams.userName).then(
            function (response) {
                if (_.isUndefined(response.userPreferences) || _.size(response.userPreferences) < 1 || _.isNull(response.userPreferences[0])) {
                    $scope.emptyPreferenceResult = true;
                    $scope.isPreferencesLoading = false;
                    $scope.optionsList = [];
                   // $scope.displayedUserPreferences = [];
                }
                else {
                    $scope.emptyPreferenceResult = false;
                  //  $scope.isPreferencesLoading = false;
                    $scope.optionsList = response.userPreferences;
                }
            }, function (error) {
                $scope.emptyPreferenceResult = true;
                $scope.isPreferencesLoading = false;
            });

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


        $scope.searchApplications = function (option) {

            var group = $scope.option.groupName;

          userPreferencesService.getUserPreferences($stateParams.userName,$scope.option.groupName).then(
                function (response) {
                    if (_.isUndefined(response.userPreferences) || _.size(response.userPreferences) < 1 || _.isNull(response.userPreferences[0])) {
                        $scope.emptyPreferenceResult = true;
                        $scope.isPreferencesLoading = false;
                        $scope.userPreferencesList = [];
                        $scope.displayedUserPreferences = [];
                    }
                    else {
                        $scope.emptyPreferenceResult = false;
                        $scope.isPreferencesLoading = false;
                        $scope.userPreferencesList = response.userPreferences;
                    }
                }, function (error) {
                    $scope.emptyPreferenceResult = true;
                    $scope.isPreferencesLoading = false;
                });

        };

        $scope.resetForm = function () {
            $scope.option = '';
            $scope.searchApplications($stateParams.userName,'');

        };

    }
]);

userPreferencesModule.controller('userPreferencesModalInstanceCtrl', ['$log', '$scope',
    function ($log, $scope) {


    }]);
