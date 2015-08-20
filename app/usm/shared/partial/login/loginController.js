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
                $scope.messageDivClass = "container alert alert-danger";
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
