angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $location){
	$scope.randomNumber = 5;
	$scope.user = {};

	$scope.getUser = function(){
		$scope.user.name = "Antonia";
		$scope.user.email = "antonia@havsochvattenmyndigheten.se";
		$scope.user.roles = [{
			role : "Assets Admin"},
		{
			role : "Superuser"},
		{
			role : "Report Manager"}
		];
	};

	$scope.getUser();

	$scope.signOut = function(){
		console.log("log out");
		$scope.user =  {
		};
	};

	$scope.signIn = function(){
		console.log("Signing in...");
		$scope.getUser();
	};
});
