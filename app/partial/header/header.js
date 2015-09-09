angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $state, $rootScope, $location, $localStorage, userService, renewloginpanel, configurationService){
	$scope.randomNumber = 5;
	$scope.user = {};

    var init = function(){
        $scope.userName = userService.getUserName();
        $scope.isAuthenticated = userService.isLoggedIn();
        $scope.contexts = userService.getContexts();
        $scope.currentContext = userService.getCurrentContext();
    };
    init();
    $rootScope.$on('AuthenticationSuccess', function () {
        init();
    });
    $rootScope.$on('needsAuthentication', function () {
        init();
    });
    $rootScope.$on('ContextSwitch', function () {
        init();
    });

	$scope.getUser = function(){
        $scope.user.name = "Antonia";
		$scope.user.name = userService.getUserName();

		$scope.user.email = "antonia@havsochvattenmyndigheten.se";

	};

	$scope.getUser();

	$scope.signOut = function(){
		userService.logout();
        configurationService.clear();
        init();
        $state.go('app.today');
	};

	$scope.signIn = function(){
		console.log("Signing in...");
		renewloginpanel.show().then(function(){
            init();
        });
	};

    $scope.switchContext = function(){
        userService.switchContext().then(function(){
            configurationService.clear();
            init();
        });
    };

});
