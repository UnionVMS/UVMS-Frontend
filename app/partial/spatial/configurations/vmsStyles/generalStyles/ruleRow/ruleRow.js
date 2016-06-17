angular.module('unionvmsWeb').controller('RulerowCtrl',function($scope){
	//$scope.preferencesServ = PreferencesService;

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
			
			if($scope.componentStyle === 'segment' && $scope.configModel.segmentStyle.attribute === 'courseOverGround' || $scope.componentStyle === 'position' && $scope.configModel.positionStyle.attribute === 'reportedCourse' ){
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
		}
	};
	
	$scope.isPropertyFromValid = function(first){
		if(angular.isDefined($scope['rowstylesForm' + $scope.item.id]) && angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyFrom) && angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyFrom.$error) &&
		$scope['rowstylesForm' + $scope.item.id].propertyFrom.$error.hasError && first && angular.isDefined($scope['rowstylesForm' + $scope.item.id]) && angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyTo) &&
		angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyTo.$error) && ($scope['rowstylesForm' + $scope.item.id].propertyFrom.$dirty || $scope.submitedWithErrors)){
			return false;
		}else{
			return true;
		}
	};

	$scope.isPropertyToValid = function(){
		if(angular.isDefined($scope['rowstylesForm' + $scope.item.id]) && angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyTo) && angular.isDefined($scope['rowstylesForm' + $scope.item.id].propertyTo.$error) && $scope['rowstylesForm' + $scope.item.id].propertyTo.$error.hasError && ($scope['rowstylesForm' + $scope.item.id].propertyTo.$dirty || $scope.submitedWithErrors)){
			return false;
		}else{
			return true;
		}
	};
	
	$scope.removeRule = function(index){
		$scope["rowstylesForm" + $scope.item.id].$setDirty();
		$scope.configModel[$scope.componentStyle + 'Style'].style.splice(index, 1);
		
		if($scope.configModel[$scope.componentStyle + 'Style'].style.length > index){
			if(index > 0){
				$scope.configModel[$scope.componentStyle + 'Style'].style[index].propertyFrom = $scope.configModel[$scope.componentStyle + 'Style'].style[index-1].propertyTo;
			}
			if($scope.configModel[$scope.componentStyle + 'Style'].style[index].propertyFrom >= $scope.configModel[$scope.componentStyle + 'Style'].style[index].propertyTo){
				$scope.configModel[$scope.componentStyle + 'Style'].style[index].propertyTo = undefined;
			}
			$scope.updateNextRule(index);
		}
	};

	$scope.updateNextRule = function(index){
		if(index === 0 || index > $scope.configModel[$scope.tabName + 'Style'].style.length-1){
			return;
		}
		
		$scope.configModel[$scope.tabName + 'Style'].style[index].propertyFrom = $scope.configModel[$scope.tabName + 'Style'].style[index-1].propertyTo;
		if($scope.configModel[$scope.tabName + 'Style'].style[index].propertyFrom >= $scope.configModel[$scope.tabName + 'Style'].style[index].propertyTo){
			$scope.configModel[$scope.tabName + 'Style'].style[index].propertyTo = undefined;
			if(index + 1 < $scope.configModel[$scope.tabName + 'Style'].style.length) {
				$scope.configModel[$scope.tabName + 'Style'].style[index+1].propertyFrom = undefined;
			}
		}
	};
	
	setTimeout(function () {
		if($scope.componentStyle === 'segment' && ['distance','duration','speedOverGround','courseOverGround'].indexOf($scope.configModel.segmentStyle.attribute) !== -1 || $scope.componentStyle === 'position' && ['reportedSpeed','calculatedSpeed','reportedCourse'].indexOf($scope.configModel.positionStyle.attribute) !== -1 ){
			$scope.validatePropertyFrom(true);
			$scope.validatePropertyTo();
		}
		$scope.validatePropertyColor($scope.item,'rowstylesForm');
	},200);
	
});