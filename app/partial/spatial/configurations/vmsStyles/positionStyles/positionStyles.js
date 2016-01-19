angular.module('unionvmsWeb').controller('PositionstylesCtrl',function($scope,configurationService){
	$scope.positionProperties = [{"text": "F.S.", "code": "countryCode"}, {"text": "Measured speed", "code": "reportedSpeed"}, {"text": "Calculated speed", "code": "calculatedSpeed"}, {"text": "Course", "code": "reportedCourse"}, {"text": "Type", "code": "type"}, {"text": "Activity", "code": "activity"}];
	$scope.positionRuleId = 0;
	$scope.movementTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');
    $scope.activityTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT');

	
	$scope.isAddNewRuleActive = true;
	
	var setLoadedRule = function(value,key) {
		var rangeData;
		if($scope.loadedPositionProperties.attribute === "reportedSpeed"){
			rangeData = key.split("-");
			$scope.positionPropertyList.push({"id": $scope.positionRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedPositionProperties.attribute === "calculatedSpeed") {
			rangeData = key.split("-");
			$scope.positionPropertyList.push({"id": $scope.positionRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedPositionProperties.attribute === "reportedCourse") {
			rangeData = key.split("-");
			$scope.positionPropertyList.push({"id": $scope.positionRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedPositionProperties.attribute === "type") {
			$scope.positionPropertyList.push({"id": $scope.positionRuleId, "code": key, "color": value});
		}else if($scope.loadedPositionProperties.attribute === "activity") {
			$scope.positionPropertyList.push({"id": $scope.positionRuleId, "code": key, "color": value});
		}
		$scope.positionRuleId++;
	};
	
	$scope.addNewRule = function(){
		if($scope.isAddNewRuleActive){
			var nextFrom;
			if($scope.configModel.positionStyle.style && $scope.configModel.positionStyle.style.length > 0){
				nextFrom = _.last($scope.configModel.positionStyle.style).propertyTo;
			}
			$scope.configModel.positionStyle.style.push({"id": $scope.positionRuleId, "propertyFrom": nextFrom, "propertyTo": undefined, "color": undefined});
			$scope.positionRuleId++;
			$scope.isAddNewRuleActive = false;
		}
	};
	
	$scope.removeRuleByIndex = function(index, ruleId){
		$scope.configModel.positionStyle.style.splice(index, 1);
		
		if($scope.configModel.positionStyle.style.length > index + 1){
			if(index > 0){
				$scope.configModel.positionStyle.style[index].propertyFrom = $scope.configModel.positionStyle.style[index-1].propertyTo;
			}
			if($scope.configModel.positionStyle.style[index].propertyFrom >= $scope.configModel.positionStyle.style[index].propertyTo){
				$scope.configModel.positionStyle.style[index].propertyTo = undefined;
			}
			$scope.updateNextRule($scope.configModel.positionStyle.style[index]);
		}
		$scope.isAddNewRuleActive = $scope.getNrErrors() === 0;
	};
	
	$scope.changeProperty = function(){
		if($scope.configModel.positionStyle.attribute !== 'countryCode' && $scope.configModel.positionStyle.attribute === $scope.configModel.stylesSettings.positions.attribute){
			$scope.loadPositionProperties();
			return;
		}
		
		$scope.configModel.positionStyle.style = [];
		$scope.isAddNewRuleActive = true;
		$scope.configModel.positionStyle.defaultColor = undefined;
		
		if($scope.configModel.positionStyle.attribute === 'activity'){
			angular.forEach($scope.activityTypes, function(item){
				$scope.positionRuleId = 0;
				$scope.configModel.positionStyle.style.push({'id': $scope.positionRuleId,
															'code': item.text,
															'color': $scope.generateRandomColor()
															});
				$scope.positionRuleId++;
			});
		}else if($scope.configModel.positionStyle.attribute === 'type'){
			angular.forEach($scope.movementTypes, function(item){
				$scope.positionRuleId = 0;
				$scope.configModel.positionStyle.style.push({'id': $scope.positionRuleId,
															'code': item.text,
															'color': $scope.generateRandomColor()
															});
				$scope.positionRuleId++;
			});
		}
		if($scope.configModel.positionStyle.defaultColor !== undefined){
			$scope.configModel.positionStyle.defaultColor = undefined;
		}
		
		$scope.$watch('positionsForm.defaultForm', function() {
			if(angular.isDefined($scope.positionsForm) && angular.isDefined($scope.positionsForm.defaultForm) && angular.isDefined($scope.positionsForm.defaultForm.defaultColor)){
				$scope.positionsForm.defaultForm.defaultColor.$setPristine();
				$scope.validateDefaultColor();
			}
		});
	};
	
	$scope.updateNextRule = function(item){
		if(item === _.last($scope.configModel.positionStyle.style)){
			return;
		}
		var index = $scope.configModel.positionStyle.style.indexOf(item) + 1;
		$scope.configModel.positionStyle.style[index].propertyFrom = $scope.configModel.positionStyle.style[index-1].propertyTo;
		if($scope.configModel.positionStyle.style[index].propertyFrom >= $scope.configModel.positionStyle.style[index].propertyTo){
			$scope.configModel.positionStyle.style[index].propertyTo = undefined;
			if(index + 1 < $scope.configModel.positionStyle.style.length) {
				$scope.configModel.positionStyle.style[index+1].propertyFrom = undefined;
			}
		}
	};
	
	$scope.validateDefaultColor = function(){
		if(angular.isDefined($scope.positionsForm) && angular.isDefined($scope.positionsForm.defaultForm) && angular.isDefined($scope.positionsForm.defaultForm.defaultColor)){
			if($scope.configModel.positionStyle.defaultColor && ($scope.configModel.positionStyle.defaultColor.length <= 3 || $scope.configModel.positionStyle.defaultColor.length > 7 || $scope.configModel.positionStyle.defaultColor.indexOf('#') === -1)){
				$scope.positionsForm.defaultForm.defaultColor.$setValidity('segDefColor', false);
			}else{
				$scope.positionsForm.defaultForm.defaultColor.$setValidity('segDefColor', true);
			}
			if(!$scope.configModel.positionStyle.defaultColor && $scope.configModel.positionStyle.defaultColor !== 0){
				$scope.positionsForm.defaultForm.defaultColor.$setValidity('requiredField', false);
			}else{
				$scope.positionsForm.defaultForm.defaultColor.$setValidity('requiredField', true);
			}
			if($scope.positionsForm.defaultForm.defaultColor.$valid){
				$scope.positionsForm.defaultForm.$setValidity('hasError', true);
			}else{
				$scope.positionsForm.defaultForm.$setValidity('hasError', false);
			}
		}
	};
	
	$scope.loadPositionProperties = function(){
		if(angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.stylesSettings) && angular.isDefined($scope.configModel.stylesSettings.positions)){
			$scope.loadedPositionProperties = {};
			angular.copy($scope.configModel.stylesSettings.positions, $scope.loadedPositionProperties);
			$scope.configModel.positionStyle = {};
			
			switch ($scope.loadedPositionProperties.attribute) {
				case "reportedSpeed":
				case "calculatedSpeed":
				case "reportedCourse":
					$scope.positionPropertyList = [];
					angular.forEach($scope.loadedPositionProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel.positionStyle.defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.positionPropertyList = _.sortBy($scope.positionPropertyList, 'propertyFrom');
					$scope.configModel.positionStyle.attribute = $scope.loadedPositionProperties.attribute;
					$scope.configModel.positionStyle.style = $scope.positionPropertyList;
					break;
				case "countryCode":
					$scope.configModel.positionStyle.attribute = $scope.loadedPositionProperties.attribute;
					break;
				case "activity":
				case "type":
					$scope.positionPropertyList = [];
					angular.forEach($scope.loadedPositionProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel.positionStyle.defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.configModel.positionStyle.attribute = $scope.loadedPositionProperties.attribute;
					$scope.configModel.positionStyle.style = $scope.positionPropertyList;
					break;
				default:
					$scope.configModel.positionStyle = {};
					$scope.configModel.positionStyle.style = [];
					$scope.positionRuleId = _.keys($scope.configModel.positionStyle.style).length;
					break;
				}
		}else{
			$scope.configModel = {};
			$scope.configModel.positionStyle = {};
			$scope.configModel.positionStyle.style = [];
			$scope.positionRuleId = _.keys($scope.configModel.positionStyle.style).length;
		}
	};
	
	$scope.getNrErrors = function() {
		var nrErrors = 0;
		if(angular.isDefined($scope.positionsForm)){
			angular.forEach($scope.configModel.positionStyle.style, function(item){
				if(angular.isDefined($scope.positionsForm["positionstylesForm" + item.id])){
					angular.forEach($scope.positionsForm["positionstylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}else if(angular.isDefined($scope.positionsForm["rowstylesForm" + item.id])){
					angular.forEach($scope.positionsForm["rowstylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}
			});
		}
		return nrErrors;
	};
	
	$scope.generateRandomColor = function(){
		var color = "#";
	    var possible = "0123456789";
	    for( var i=0; i < 6; i++ ){
	        color += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return color;
	};
	
	$scope.$on('updateAddNewRuleActive', function(event) {
		$scope.isAddNewRuleActive = $scope.getNrErrors() === 0 ? true : false;
	});
	$scope.$on('updateNextRule', function(event, item) {
		$scope.updateNextRule(item);
	});
	$scope.$on('removeRule', function(event, index, ruleId) {
		$scope.removeRuleByIndex(index, ruleId);
	});
	
	$scope.$watch('loadedAllSettings', function() {
		if($scope.loadedAllSettings && $scope.configModel && $scope.configModel.stylesSettings && $scope.configModel.stylesSettings.positions && $scope.configModel.stylesSettings.positions.style){
			$scope.loadPositionProperties();
		}
	});
});