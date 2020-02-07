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
angular.module('loginCtrl',['auth'])
    .controller('customLoginController',['$scope', '$log', 'authenticateUser', 'userService','$state','$stateParams','authRouter','$uibModal',
        function ($scope, $log, authenticateUser,userService,$state,$stateParams,authRouter,$uibModal) {
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

                return $uibModal.open({
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
