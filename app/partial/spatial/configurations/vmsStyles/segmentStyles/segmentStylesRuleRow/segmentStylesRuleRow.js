angular.module('unionvmsWeb').controller('SegmentstylesrulerowCtrl',function($scope){
	$scope.validatePropertyFrom = function(first){
		if(first && angular.isDefined($scope.item)){
			if($scope.item.propertyFrom >= $scope.item.propertyTo){
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', true);
			}
			if(!$scope.item.propertyFrom && $scope.item.propertyFrom !== 0){
				$scope["segmentstylesForm" + $scope.item.id].propertyFrom.$setValidity('requiredField', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyFrom.$setValidity('requiredField', true);
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	$scope.validatePropertyTo = function(){
		if (angular.isDefined($scope.item)){
			if($scope.item.propertyFrom >= $scope.item.propertyTo){
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', true);
			}
			if(!$scope.item.propertyTo && $scope.item.propertyTo !== 0){
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('requiredField', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyTo.$setValidity('requiredField', true);
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	
	$scope.validatePropertyColor = function(){
		if (angular.isDefined($scope.item)){
			if($scope.item.color && ($scope.item.color.length <= 3 || $scope.item.color.indexOf('#') === -1)){
				$scope["segmentstylesForm" + $scope.item.id].propertyColor.$setValidity('segPropColor', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyColor.$setValidity('segPropColor', true);
			}
			if(!$scope.item.color && $scope.item.color !== 0){
				$scope["segmentstylesForm" + $scope.item.id].propertyColor.$setValidity('requiredField', false);
			}else{
				$scope["segmentstylesForm" + $scope.item.id].propertyColor.$setValidity('requiredField', true);
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	
	$scope.getNrErrors = function() {
		var nrErrors = 0;
		if (angular.isDefined($scope.item)){
			angular.forEach(_.allKeys($scope["segmentstylesForm" + $scope.item.id].$error), function(item){
				nrErrors += $scope["segmentstylesForm" + $scope.item.id].$error[item].length;
			});
		}
		return nrErrors;
	};
	
	$scope.removeRule = function(index){
		$scope.$emit('removeRule', index, $scope.item.id);
	};
	
	$scope.updateNextRule = function(){
		$scope.$emit('updateNextRule', $scope.item);
	};
	
	$scope.checkIfAddNewRuleActive = function(){
		$scope.$emit('updateAddNewRuleActive');
	};
	
	setTimeout(function () {
		$scope.validatePropertyFrom(true);
		$scope.validatePropertyTo();
		$scope.validatePropertyColor();
	},200);
	
});