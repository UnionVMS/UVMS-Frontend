angular.module('unionvmsWeb').controller('SegmentstylesCtrl',function($scope){
	$scope.segmentProperties = [];
	$scope.segmentProperties.push({"text": "Measured speed", "code": "speedOverGround"});
	
	$scope.isAddNewRuleActive = true;
	
	$scope.addNewRule = function(){
		if($scope.isAddNewRuleActive){
			var nextFrom;
			if($scope.configModel.segmentStyle.style && $scope.configModel.segmentStyle.style.length > 0){
				nextFrom = _.last($scope.configModel.segmentStyle.style).propertyTo;
			}
			$scope.configModel.segmentStyle.style.push({"propertyFrom": nextFrom, "propertyTo": undefined, "color": undefined});
			$scope.isAddNewRuleActive = false;
		}
	};
	
	$scope.removeRuleByIndex = function(index, nrErrors){
		$scope.configModel.segmentStyle.style.splice(index, 1);
		
		if($scope.configModel.segmentStyle.style.length > index + 1){
			if(index > 0){
				$scope.configModel.segmentStyle.style[index].propertyFrom = $scope.configModel.segmentStyle.style[index-1].propertyTo;
			}
			if($scope.configModel.segmentStyle.style[index].propertyFrom >= $scope.configModel.segmentStyle.style[index].propertyTo){
				$scope.configModel.segmentStyle.style[index].propertyTo = undefined;
			}
			$scope.updateNextRule($scope.configModel.segmentStyle.style[index]);
		}
		$scope.isAddNewRuleActive = _.allKeys($scope.segmentsForm.$error).length === nrErrors || (_.allKeys($scope.segmentsForm.$error).length === 1 + nrErrors && $scope.segmentsForm.$error.segDefColor);
	};
	
	$scope.changeProperty = function(){
		if($scope.configModel && $scope.configModel.segmentStyle && $scope.configModel.segmentStyle.attribute){
			$scope.configModel.segmentStyle.style = $scope.loadedSegmentProperties.style || [];
		}else{
			$scope.configModel.segmentStyle.style = [];
		}
	};
	
	$scope.updateNextRule = function(item){
		if(item === _.last($scope.configModel.segmentStyle.style)){
			return;
		}
		var index = $scope.configModel.segmentStyle.style.indexOf(item) + 1;
		$scope.configModel.segmentStyle.style[index].propertyFrom = $scope.configModel.segmentStyle.style[index-1].propertyTo;
		if($scope.configModel.segmentStyle.style[index].propertyFrom >= $scope.configModel.segmentStyle.style[index].propertyTo){
			$scope.configModel.segmentStyle.style[index].propertyTo = undefined;
			if(index + 1 < $scope.configModel.segmentStyle.style.length) {
				$scope.configModel.segmentStyle.style[index+1].propertyFrom = undefined;
			}
		}
	};
	
	$scope.validateDefaultColor = function(){
		if($scope.configModel.segmentStyle.defaultColor && ($scope.configModel.segmentStyle.defaultColor.length <= 3 || $scope.configModel.segmentStyle.defaultColor.indexOf('#') === -1)){
			$scope.segmentDefaultForm.$setValidity('segDefColor', false);
		}else{
			$scope.segmentDefaultForm.$setValidity('segDefColor', true);
		}
	};
	
	$scope.loadSegmentProperties = function(){
		$scope.loadedSegmentProperties = {};
		angular.copy($scope.configModel.stylesSettings.segments,$scope.loadedSegmentProperties);
		$scope.configModel.segmentStyle = {};
		
			if($scope.loadedSegmentProperties.attribute === "speedOverGround"){
				var speedOverList = [];
				angular.forEach($scope.loadedSegmentProperties.style, function(value,key){
					if(key === "default"){
						$scope.configModel.segmentStyle.defaultColor = value;
					}else{
						var rangeData = key.split("-");
						speedOverList.push({"propertyFrom": parseInt(rangeData[0]), "propertyTo": rangeData[1] ? parseInt(rangeData[1]) : undefined, "color": value});
					}
				});
				speedOverList = _.sortBy(speedOverList, 'propertyFrom');
				$scope.configModel.segmentStyle.attribute = $scope.loadedSegmentProperties.attribute;
				$scope.configModel.segmentStyle.style = speedOverList;
				$scope.loadedSegmentProperties.style = speedOverList;
			}
	};
	
	$scope.$watch('configModel.stylesSettings.segments.attribute', function(newVal, oldVal){
		if (newVal === 'speedOverGround'){
    	   $scope.loadSegmentProperties();
    	   $scope.changeProperty();
		}
    });
	
	$scope.$on('updateAddNewRuleActive', function(event) { $scope.isAddNewRuleActive = _.isEmpty($scope.segmentsForm.$error) || (_.allKeys($scope.segmentsForm.$error).length === 1 && $scope.segmentsForm.$error.segDefColor) ? true : false; });
	$scope.$on('updateNextRule', function(event, item) { $scope.updateNextRule(item); });
	$scope.$on('removeRule', function(event, index, nrErrors) { $scope.removeRuleByIndex(index, nrErrors); });
});