angular.module('unionvmsWeb').controller('SegmentstylesCtrl',function($scope){
	$scope.segmentProperties = [];
	$scope.segmentProperties.push({"text": "Measured speed", "code": "speedOverGround"});
	
	$scope.segmentProperty = null;
	
	$scope.rulesList = [];
	
	$scope.addNewRule = function(){
		$scope.rulesList.push({"propertyFrom": undefined, "propertyTo": undefined, "color": undefined});
	};
	
	$scope.removeRule = function(index){
		$scope.rulesList.splice(index, 1);
	};
	
	$scope.changeProperty = function(){
		$scope.rulesList = [];
	};
	
	$scope.$watch('segmentProperty', $scope.changeProperty);
});