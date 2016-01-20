angular.module('unionvmsWeb').controller('SegmentstylesCtrl',function($scope,configurationService){
	$scope.segmentProperties = [{"text": "F.S.", "code": "countryCode"}, {"text": "Distance", "code": "distance"}, /*{"text": "Duration", "code": "duration"},*/ {"text": "Measured speed", "code": "speedOverGround"}, {"text": "Course", "code": "courseOverGround"}, {"text": "Category", "code": "segmentCategory"}];
	$scope.segmentRuleId = 0;
	$scope.categoryTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'CATEGORY_TYPE'), 'CATEGORY_TYPE', 'MOVEMENT');
	
	$scope.isAddNewRuleActive = true;
	
	var setLoadedRule = function(value,key) {
		var rangeData;
		if($scope.loadedSegmentProperties.attribute === "distance") {
			rangeData = key.split("-");
			$scope.segmentPropertyList.push({"id": $scope.segmentRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedSegmentProperties.attribute === "duration") {
			rangeData = key.split("-");
			$scope.segmentPropertyList.push({"id": $scope.segmentRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedSegmentProperties.attribute === "speedOverGround"){
			rangeData = key.split("-");
			$scope.segmentPropertyList.push({"id": $scope.segmentRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedSegmentProperties.attribute === "courseOverGround") {
			rangeData = key.split("-");
			$scope.segmentPropertyList.push({"id": $scope.segmentRuleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
		}else if($scope.loadedSegmentProperties.attribute === "segmentCategory") {
			$scope.segmentPropertyList.push({"id": $scope.segmentRuleId, "code": key, "color": value});
		}
		$scope.segmentRuleId++;
	};
	
	$scope.addNewRule = function(){
		if($scope.isAddNewRuleActive){
			var nextFrom;
			if($scope.configModel.segmentStyle.style && $scope.configModel.segmentStyle.style.length > 0){
				nextFrom = _.last($scope.configModel.segmentStyle.style).propertyTo;
			}
			$scope.configModel.segmentStyle.style.push({"id": $scope.segmentRuleId, "propertyFrom": nextFrom, "propertyTo": undefined, "color": undefined});
			$scope.segmentRuleId++;
			$scope.isAddNewRuleActive = false;
		}
	};
	
	$scope.removeRuleByIndex = function(index, ruleId){
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
		$scope.isAddNewRuleActive = $scope.getNrErrors() === 0;
	};
	
	$scope.changeProperty = function(){
		if($scope.configModel.segmentStyle.attribute !== 'countryCode' && $scope.configModel.segmentStyle.attribute === $scope.configModel.stylesSettings.segments.attribute){
			$scope.loadSegmentProperties();
			return;
		}
		
		$scope.configModel.segmentStyle.style = [];
		$scope.isAddNewRuleActive = true;
		$scope.configModel.segmentStyle.defaultColor = undefined;
		
		if($scope.configModel.segmentStyle.attribute === 'segmentCategory'){
			angular.forEach($scope.categoryTypes, function(item){
				$scope.segmentRuleId = 0;
				$scope.configModel.segmentStyle.style.push({'id': $scope.segmentRuleId,
															'code': item.text,
															'color': $scope.generateRandomColor()
															});
				$scope.segmentRuleId++;
			});
		}
		$scope.$watch('segmentsForm.defaultForm', function() {
			if(angular.isDefined($scope.segmentsForm) && angular.isDefined($scope.segmentsForm.defaultForm) && angular.isDefined($scope.segmentsForm.defaultForm.defaultColor)){
				$scope.segmentsForm.defaultForm.defaultColor.$setPristine();
				$scope.validateDefaultColor();
			}
		});
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
		if(angular.isDefined($scope.segmentsForm) && angular.isDefined($scope.segmentsForm.defaultForm) && angular.isDefined($scope.segmentsForm.defaultForm.defaultColor)){
			if($scope.configModel.segmentStyle.defaultColor && ($scope.configModel.segmentStyle.defaultColor.length <= 3 || $scope.configModel.segmentStyle.defaultColor.length > 7 || $scope.configModel.segmentStyle.defaultColor.indexOf('#') === -1)){
				$scope.segmentsForm.defaultForm.defaultColor.$setValidity('segDefColor', false);
			}else{
				$scope.segmentsForm.defaultForm.defaultColor.$setValidity('segDefColor', true);
			}
			if(!$scope.configModel.segmentStyle.defaultColor && $scope.configModel.segmentStyle.defaultColor !== 0){
				$scope.segmentsForm.defaultForm.defaultColor.$setValidity('requiredField', false);
			}else{
				$scope.segmentsForm.defaultForm.defaultColor.$setValidity('requiredField', true);
			}
			if($scope.segmentsForm.defaultForm.defaultColor.$valid){
				$scope.segmentsForm.defaultForm.$setValidity('hasError', true);
			}else{
				$scope.segmentsForm.defaultForm.$setValidity('hasError', false);
			}
		}
	};
	
	$scope.loadSegmentProperties = function(){
		if(angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.stylesSettings) && angular.isDefined($scope.configModel.stylesSettings.segments)){
			$scope.loadedSegmentProperties = {};
			angular.copy($scope.configModel.stylesSettings.segments, $scope.loadedSegmentProperties);
			$scope.configModel.segmentStyle = {};
			
			switch ($scope.loadedSegmentProperties.attribute) {
				case "speedOverGround":
				case "courseOverGround":
				case "distance":
				case "duration":
					$scope.segmentPropertyList = [];
					angular.forEach($scope.loadedSegmentProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel.segmentStyle.defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.segmentPropertyList = _.sortBy($scope.segmentPropertyList, 'propertyFrom');
					$scope.configModel.segmentStyle.attribute = $scope.loadedSegmentProperties.attribute;
					$scope.configModel.segmentStyle.style = $scope.segmentPropertyList;
					break;
				case "countryCode":
					$scope.configModel.segmentStyle.attribute = $scope.loadedSegmentProperties.attribute;
					break;
				case "segmentCategory":
					$scope.segmentPropertyList = [];
					angular.forEach($scope.loadedSegmentProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel.segmentStyle.defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.configModel.segmentStyle.attribute = $scope.loadedSegmentProperties.attribute;
					$scope.configModel.segmentStyle.style = $scope.segmentPropertyList;
					break;
				default:
					$scope.configModel.segmentStyle = {};
					$scope.configModel.segmentStyle.style = [];
					$scope.segmentRuleId = _.keys($scope.configModel.segmentStyle.style).length;
					break;
				}
		}else{
			$scope.configModel = {};
			$scope.configModel.segmentStyle = {};
			$scope.configModel.segmentStyle.style = [];
			$scope.segmentRuleId = _.keys($scope.configModel.segmentStyle.style).length;
		}
	};
	
	$scope.getNrErrors = function() {
		var nrErrors = 0;
		if(angular.isDefined($scope.segmentsForm)){
			angular.forEach($scope.configModel.segmentStyle.style, function(item){
				if(angular.isDefined($scope.segmentsForm["segmentstylesForm" + item.id])){
					angular.forEach($scope.segmentsForm["segmentstylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}else if(angular.isDefined($scope.segmentsForm["rowstylesForm" + item.id])){
					angular.forEach($scope.segmentsForm["rowstylesForm" + item.id].$error, function(item){
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
		if($scope.loadedAllSettings && $scope.configModel && $scope.configModel.stylesSettings && $scope.configModel.stylesSettings.segments && $scope.configModel.stylesSettings.segments.style){
			$scope.loadSegmentProperties();
		}
	});
	
});