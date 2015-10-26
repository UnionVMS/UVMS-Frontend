angular.module('loginCtrl',['auth'])
    .controller('customLoginController',['$scope', '$log', 'authenticateUser', 'userService','$state','$stateParams','authRouter','$modal',
        function ($scope, $log, authenticateUser,userService,$state,$stateParams,authRouter,$modal) {
            $log.debug('$stateParams.toState',$stateParams.toState);
            var toState = $stateParams.toState;
            var toParams = $stateParams.toParams;
            $scope.performLogin = function (loginInfo) {
                authenticateUser.authenticate(loginInfo).then(
                    function (response) {
                        if(response.token) {
                            userService.login(response.token);
                            $state.go(toState,toParams);
                        } else {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = "There was a problem logging you in. No token received";
                        }
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            };
            $scope.resetPassword = function () {

                return $modal.open({
                    templateUrl: 'service/common/auth/templates/resetPassword.html',
                    controller: 'resetPasswordController'
                }).result.then(

                    function(error){
                        $log.error(error);
                    }
                );
            };
        }
    ]);
