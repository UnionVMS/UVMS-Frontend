angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $location){
	$scope.randomNumber = Math.floor((Math.random() * 10) + 1);
});
