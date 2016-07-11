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
//LOGIN CONTROLLER
angular.module('unionvmsWeb').controller('uvmsLoginController', function($scope, $log, authenticateUser, userService, $state, $stateParams, $modal, locale) {

    $log.debug('$stateParams.toState',$stateParams.toState);
    var toState = $stateParams.toState;
    var toParams = $stateParams.toParams;

    //Already logged in?
    if(userService.isLoggedIn()){
        $state.go(toState, toParams, {location: 'replace'});
    }

    //LOGIN
    $scope.submitAttempted = false;
    $scope.performLogin = function (loginInfo) {
        $scope.submitAttempted = true;
        if($scope.loginForm.$valid) {
            $scope.actionMessage = undefined;
            authenticateUser.authenticate(loginInfo).then(
                function (response) {
                    if(response.token) {
                        userService.login(response.token);
                        $state.go(toState, toParams, {location: 'replace'});
                    } else {
                        $scope.actionMessage = locale.getString('login.login_error_no_token_received');
                    }
                },
                function (error) {
                    $log.error("Error loggin in.", error);
                    $scope.actionMessage = error;
                }
            );
        }
    };

    //RESET PASSWORD
    $scope.resetPassword = function () {

        return $modal.open({
            templateUrl: 'service/common/auth/templates/resetPassword.html',
            backdrop: 'static', //will not close when clicking outside the modal window
            controller: 'resetPasswordController'
        }).result.then(

            function(error){
                $log.error(error);
            }
        );
    };
});

//LOGOUT CONTROLLER
angular.module('unionvmsWeb').controller('uvmsLogoutController', function($scope, $timeout, $state, $stateParams, userService, configurationService) {

    $scope.loginState = $stateParams.loginState;
    $scope.logoutMessage = $stateParams.logoutMessage;
    //Logout and clear configurations
    userService.logout();
    configurationService.clear();

    //Go to login page after 1500ms
    $timeout(function(){
        $state.go('uvmsLogin', {}, {location: 'replace'});
    }, 1500);
});