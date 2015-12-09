angular.module('unionvmsWeb').controller('SegmentstylesrulerowCtrl',function($scope){
	$scope.validatePropertyTo = function(){
		if($scope.item.propertyFrom >= $scope.item.propertyTo){
			$scope.segmentstylesForm.$setValidity('segPropTo', false);
		}else{
			$scope.segmentstylesForm.$setValidity('segPropTo', true);
		}
		
		$scope.checkIfAddNewRuleActive();
	};
	
	$scope.validatePropertyColor = function(){
		if($scope.item.color && ($scope.item.color.length <= 3 || $scope.item.color.indexOf('#') === -1)){
			$scope.segmentstylesForm.$setValidity('segPropColor', false);
		}else{
			$scope.segmentstylesForm.$setValidity('segPropColor', true);
		}
		$scope.checkIfAddNewRuleActive();
	};
	
	$scope.removeRule = function(index){
		$scope.$emit('removeRule', index, _.allKeys($scope.segmentstylesForm.$error).length);
	};
	
	$scope.checkIfAddNewRuleActive = function(item){
		$scope.$emit('updateAddNewRuleActive');
	};
	
	$scope.updateNextRule = function(){
		$scope.$emit('updateNextRule', $scope.item);
	};
	
	$scope.$on('checkIfAddNewRuleActive', function(event, data) { $scope.checkIfAddNewRuleActive(data); });
});