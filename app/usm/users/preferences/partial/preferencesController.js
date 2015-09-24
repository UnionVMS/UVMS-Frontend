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
    }
]);

userPreferencesModule.controller('userPreferencesModalInstanceCtrl', ['$log', '$scope',
    function ($log, $scope) {


    }]);
