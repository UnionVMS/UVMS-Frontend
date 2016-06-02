angular.module('unionvmsWeb').directive('tableAlert', function() {
	return {
		restrict: 'E',
		replace: true,
		controller: 'tableAlertCtrl',
		scope: {
			type: '=',
			msg: '=',
			visible: '=',
			timeout: '='
		},
		templateUrl: 'directive/common/tableAlert/tableAlert.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});

angular.module('unionvmsWeb').controller('tableAlertCtrl',['$scope','$timeout','locale', function($scope,$timeout,locale){
	$scope.hide = function(){
		$timeout(function(){
			$scope.visible = false;
		}, angular.isDefined($scope.timeout) ? $scope.timeout : 3000);
	};
	
	$scope.$watch(function(){return $scope.visible;},function(newVal){
		if(newVal===true && $scope.type !== 'info'){
			$scope.hide();
		}
	});
	
	$scope.$watch(function(){return $scope.type;},function(newVal){
		console.log(newVal);
	});
	
	$scope.$watch(function(){return $scope.msg;},function(newVal){
		$scope.message = locale.getString($scope.msg);
	});
}]);
