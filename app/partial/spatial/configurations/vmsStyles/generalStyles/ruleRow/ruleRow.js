angular.module('unionvmsWeb').controller('RulerowCtrl',function($scope){
	$scope.validatePropertyFrom = function(first){
		if(first && angular.isDefined($scope.item)){
			if(angular.isDefined($scope["rowstylesForm" + $scope.item.id].propertyFrom)){
				if(!$scope.item.propertyFrom && $scope.item.propertyFrom !== 0){
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('requiredField', false);
				}else{
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('requiredField', true);
				}
				if($scope.item.propertyFrom && $scope.item.propertyFrom < 0){
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('segPropMinFrom', false);
				}else{
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('segPropMinFrom', true);
				}
				if(angular.isDefined($scope["rowstylesForm" + $scope.item.id].propertyTo)){
					if($scope.item.propertyFrom >= $scope.item.propertyTo){
						$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', false);
					}else{
						$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', true);
					}
					if($scope["rowstylesForm" + $scope.item.id].propertyTo.$valid || _.allKeys($scope["rowstylesForm" + $scope.item.id].propertyTo.$error).length === 1 && $scope["rowstylesForm" + $scope.item.id].propertyTo.$error.hasError){
						$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('hasError', true);
					}else{
						$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('hasError', false);
					}
				}
				if($scope["rowstylesForm" + $scope.item.id].propertyFrom.$valid || _.allKeys($scope["rowstylesForm" + $scope.item.id].propertyFrom.$error).length === 1 && $scope["rowstylesForm" + $scope.item.id].propertyFrom.$error.hasError){
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('hasError', true);
				}else{
					$scope["rowstylesForm" + $scope.item.id].propertyFrom.$setValidity('hasError', false);
				}
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	$scope.validatePropertyTo = function(){
		if (angular.isDefined($scope.item) && angular.isDefined($scope["rowstylesForm" + $scope.item.id].propertyTo)){
			if($scope.item.propertyFrom >= $scope.item.propertyTo){
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', false);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropTo', true);
			}
			if(!$scope.item.propertyTo && $scope.item.propertyTo !== 0){
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('requiredField', false);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('requiredField', true);
			}
			
			if($scope.componentStyle === 'segment' && $scope.configModel.segmentStyle.attribute === 'courseOverGround' || $scope.componentStyle === 'positions' && $scope.configModel.positionStyle.attribute === 'reportedCourse' ){
				if($scope.item.propertyTo && $scope.item.propertyTo > 360){
					$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropToMax', false);
				}else{
					$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('segPropToMax', true);
				}
			}
			
			if($scope["rowstylesForm" + $scope.item.id].propertyTo.$valid || _.allKeys($scope["rowstylesForm" + $scope.item.id].propertyTo.$error).length === 1 && $scope["rowstylesForm" + $scope.item.id].propertyTo.$error.hasError){
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('hasError', true);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyTo.$setValidity('hasError', false);
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	
	$scope.validatePropertyColor = function(){
		if (angular.isDefined($scope.item) && angular.isDefined($scope["rowstylesForm" + $scope.item.id].propertyColor)){
			if($scope.item.color && ($scope.item.color.length <= 3 || $scope.item.color.length > 7 || $scope.item.color.indexOf('#') === -1)){
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('segPropColor', false);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('segPropColor', true);
			}
			if(!$scope.item.color && $scope.item.color !== 0){
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('requiredField', false);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('requiredField', true);
			}
			if($scope["rowstylesForm" + $scope.item.id].propertyColor.$valid || _.allKeys($scope["rowstylesForm" + $scope.item.id].propertyColor.$error).length === 1 && $scope["rowstylesForm" + $scope.item.id].propertyColor.$error.hasError){
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('hasError', true);
			}else{
				$scope["rowstylesForm" + $scope.item.id].propertyColor.$setValidity('hasError', false);
			}
			$scope.checkIfAddNewRuleActive();
		}
	};
	
	$scope.getNrErrors = function() {
		var nrErrors = 0;
		if (angular.isDefined($scope.item)){
			angular.forEach(_.allKeys($scope["rowstylesForm" + $scope.item.id].$error), function(item){
				nrErrors += $scope["rowstylesForm" + $scope.item.id].$error[item].length;
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
		if($scope.componentStyle === 'segment' && ['distance','duration','speedOverGround','courseOverGround'].indexOf($scope.configModel.segmentStyle.attribute) !== -1 || $scope.componentStyle === 'positions' && ['reportedSpeed','calculatedSpeed','reportedCourse'].indexOf($scope.configModel.positionStyle.attribute) !== -1 ){
			$scope.validatePropertyFrom(true);
			$scope.validatePropertyTo();
		}
		$scope.validatePropertyColor();
	},200);
	
});