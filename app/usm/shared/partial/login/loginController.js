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
var sharedModule = angular.module('shared');

sharedModule.controller('LogincontrollerCtrl', ['$rootScope', '$scope','$log', 'authenticateUser', '$localStorage', '$stateParams','$state',
    function($rootScope, $scope, $log, authenticateUser, $localStorage, $stateParams,$state){
        $scope.actionMessage="";
        $scope.userName=$localStorage.userName;

    $scope.authenticate = function(loginInfo){
        $log.log(loginInfo);
        authenticateUser.authenticate(loginInfo).then(
            function(response){
                $log.log(response);
                //$cookieStore.put("token", response.token);
                $localStorage.token = response.token;

                //$storage.authData = response.authData;

                $localStorage.userName = loginInfo.userName;
                if($stateParams.toState){
                    $state.go($stateParams.toState);
                }
                $scope.$emit('event:loginSuccessful');

            },
            function(error) {
                //delete $sessionStorage.currentUser;
                $scope.messageDivClass = "alert alert-danger";
                $scope.actionMessage= error;
            }
        );
    };
    $scope.logOut = function() {
        //$cookieStore.remove("token");
        //delete $sessionStorage.token;
        $localStorage.$reset();
        delete $rootScope.error403;
        $scope.$emit('event:loginRequired');
    };
}]);