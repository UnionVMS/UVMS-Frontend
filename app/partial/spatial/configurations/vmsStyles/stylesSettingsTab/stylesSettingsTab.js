angular.module('unionvmsWeb').controller('StylessettingstabCtrl',function($scope,locale,configurationService,$timeout){
	
	$scope.init = function(name){
		$scope.tabName = name;

		switch($scope.tabName){
			case 'position':
				$scope.properties = [{"text": locale.getString('spatial.styles_attr_countryCode'), "code": "countryCode"}, {"text": locale.getString('spatial.styles_attr_reportedSpeed'), "code": "reportedSpeed"}, {"text": locale.getString('spatial.styles_attr_calculatedSpeed'), "code": "calculatedSpeed"}, {"text": locale.getString('spatial.styles_attr_reportedCourse'), "code": "reportedCourse"}, {"text": locale.getString('spatial.styles_attr_type'), "code": "type"}, {"text": locale.getString('spatial.styles_attr_activity'), "code": "activity"}];
				$scope.ruleId = 0;
				$scope.movementTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');
				$scope.activityTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT');
				break;
			case 'segment':
				$scope.properties = [{"text": locale.getString('spatial.styles_attr_countryCode'), "code": "countryCode"}, {"text": locale.getString('spatial.styles_attr_distance'), "code": "distance"}, /*{"text": "Duration", "code": "duration"},*/ {"text": locale.getString('spatial.styles_attr_speedOverGround'), "code": "speedOverGround"}, {"text": locale.getString('spatial.styles_attr_courseOverGround'), "code": "courseOverGround"}, {"text": locale.getString('spatial.styles_attr_segmentCategory'), "code": "segmentCategory"}];
				$scope.ruleId = 0;
				$scope.categoryTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'CATEGORY_TYPE'), 'CATEGORY_TYPE', 'MOVEMENT');
				break;
		}
	};
	


    var setLoadedRule = function(value,key) {
        var rangeData;
        switch($scope.loadedProperties.attribute){
            case 'reportedSpeed':
            case 'calculatedSpeed':
            case 'reportedCourse':
            case 'distance':
            case 'duration':
            case 'speedOverGround':
            case 'courseOverGround':
                rangeData = key.split("-");
			    $scope.propertyList.push({"id": $scope.ruleId, "propertyFrom": parseFloat(rangeData[0]), "propertyTo": rangeData[1] ? parseFloat(rangeData[1]) : undefined, "color": value});
                break;
            case 'type':
            case 'activity':
            case 'segmentCategory':
                $scope.propertyList.push({"id": $scope.ruleId, "code": key, "color": value});
                break;
        }
        $scope.ruleId++;
    };

    $scope.addNewRule = function(){
		$scope.stylesSettingsForm.$setDirty();
		var nextFrom;
		if($scope.configModel[$scope.tabName + 'Style'].style && $scope.configModel[$scope.tabName + 'Style'].style.length > 0){
			nextFrom = _.last($scope.configModel[$scope.tabName + 'Style'].style).propertyTo;
		}
		$scope.configModel[$scope.tabName + 'Style'].style.push({"id": $scope.ruleId, "propertyFrom": nextFrom, "propertyTo": undefined, "color": undefined});
		$scope.ruleId++;
	};

	$scope.isRulesFormValid = function(){
		if(angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel[$scope.tabName + 'Style']) && $scope.configModel[$scope.tabName + 'Style'].attribute && angular.isDefined($scope[$scope.tabName + 'sForm']) && angular.isDefined($scope[$scope.tabName + 'sForm'].ruleslistForm) && $scope[$scope.tabName + 'sForm'].ruleslistForm.$valid){
			return true;
		}else{
			return false;
		}
	};

    $scope.changeProperty = function(){
		if($scope.configModel[$scope.tabName + 'Style'].attribute !== 'countryCode' && $scope.configModel[$scope.tabName + 'Style'].attribute === $scope.configModel.stylesSettings[$scope.tabName + 's'].attribute){
			$scope.loadProperties();
			return;
		}
		
		$scope.configModel[$scope.tabName + 'Style'].style = [];
		$scope.configModel[$scope.tabName + 'Style'].defaultColor = undefined;
		
		if(['activity','type','segmentCategory'].indexOf($scope.configModel[$scope.tabName + 'Style'].attribute) !== -1){
            var types;
            switch($scope.configModel[$scope.tabName + 'Style'].attribute){
                case 'activity':
                    types = $scope.activityTypes;
                    break;
                case 'type':
                    types = $scope.movementTypes;
                    break;
                case 'segmentCategory':
                    types = $scope.categoryTypes;
                    break;
            }

			angular.forEach(types, function(item){
				$scope.ruleId = 0;
				$scope.configModel[$scope.tabName + 'Style'].style.push({'id': $scope.ruleId,
															'code': item.text,
															'color': $scope.generateRandomColor()
															});
				$scope.ruleId++;
			});
		}



		if($scope.configModel[$scope.tabName + 'Style'].defaultColor !== undefined){
			$scope.configModel[$scope.tabName + 'Style'].defaultColor = undefined;
		}
		
		$scope.$watch($scope.tabName + 'sForm.defaultForm', function() {
			if(angular.isDefined($scope[$scope.tabName + 'sForm']) && angular.isDefined($scope[$scope.tabName + 'sForm'].defaultForm) && angular.isDefined($scope[$scope.tabName + 'sForm'].defaultForm.defaultColor)){
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setPristine();
				$scope.validateDefaultColor();
			}
		});

	};

    $scope.validateDefaultColor = function(){
		if(angular.isDefined($scope[$scope.tabName + 'sForm']) && angular.isDefined($scope[$scope.tabName + 'sForm'].defaultForm) && angular.isDefined($scope[$scope.tabName + 'sForm'].defaultForm.defaultColor)){
			if($scope.configModel[$scope.tabName + 'Style'].defaultColor && ($scope.configModel[$scope.tabName + 'Style'].defaultColor.length <= 3 || $scope.configModel[$scope.tabName + 'Style'].defaultColor.length > 7 || $scope.configModel[$scope.tabName + 'Style'].defaultColor.indexOf('#') === -1)){
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('segDefColor', false);
			}else{
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('segDefColor', true);
			}
			if(!$scope.configModel[$scope.tabName + 'Style'].defaultColor && $scope.configModel[$scope.tabName + 'Style'].defaultColor !== 0){
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('requiredField', false);
			}else{
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('requiredField', true);
			}
			if($scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$valid || _.allKeys($scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$error).length === 1 && $scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$error.hasError){
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('hasError', true);
			}else{
				$scope[$scope.tabName + 'sForm'].defaultForm.defaultColor.$setValidity('hasError', false);
			}
		}
	};

	$scope.validatePropertyColor = function(item,formBaseName){
		var form;
		var propertyColorName;
		if(formBaseName === 'alarmsListForm'){
			form = formBaseName;
			propertyColorName = 'propertyColor' + item.id;
		}else{
			form = formBaseName + item.id;
			propertyColorName = 'propertyColor';
		}
		if (angular.isDefined(item) && angular.isDefined($scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName])){
			if(item.color && (item.color.length <= 3 || item.color.length > 7 || item.color.indexOf('#') === -1)){
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('segPropColor', false);
			}else{
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('segPropColor', true);
			}
			if(!item.color && item.color !== 0){
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('requiredField', false);
			}else{
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('requiredField', true);
			}
			if($scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$valid || _.allKeys($scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$error).length === 1 &&
			$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$error.hasError){
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('hasError', true);
			}else{
				$scope[$scope.tabName + 'sForm'].ruleslistForm[form][propertyColorName].$setValidity('hasError', false);
			}
		}
	};

	$scope.isAlarmColorValid = function(item){
		if(angular.isDefined(item) && angular.isDefined($scope.alarmsForm.ruleslistForm) && angular.isDefined($scope.alarmsForm.ruleslistForm.alarmsListForm) &&
		angular.isDefined($scope.alarmsForm.ruleslistForm.alarmsListForm['propertyColor' + item.id]) &&
		angular.isDefined($scope.alarmsForm.ruleslistForm.alarmsListForm['propertyColor' + item.id].$error) &&
		$scope.alarmsForm.ruleslistForm.alarmsListForm['propertyColor' + item.id].$error.hasError &&
		($scope.alarmsForm.ruleslistForm.alarmsListForm['propertyColor' + item.id].$dirty || $scope.submitedWithErrors)){
			return false;
		}else{
			return true;
		}
	};
	

    $scope.validateLineWidth = function(){
		if(angular.isDefined($scope.segmentsForm) && angular.isDefined($scope.segmentsForm.defaultForm) && angular.isDefined($scope.segmentsForm.defaultForm.lineWidth)){
			if(!$scope.configModel.segmentStyle.lineWidth && $scope.configModel.segmentStyle.lineWidth !== 0){
				$scope.segmentsForm.defaultForm.lineWidth.$setValidity('requiredField', false);
			}else{
				$scope.segmentsForm.defaultForm.lineWidth.$setValidity('requiredField', true);
				if($scope.configModel.segmentStyle.lineWidth < 1 || $scope.configModel.segmentStyle.lineWidth > 10){
					$scope.segmentsForm.defaultForm.lineWidth.$setValidity('rangeError', false);
				}else{
					$scope.segmentsForm.defaultForm.lineWidth.$setValidity('rangeError', true);
				}
			}
			if($scope.segmentsForm.defaultForm.lineWidth.$valid || _.allKeys($scope.segmentsForm.defaultForm.lineWidth.$error).length === 1 && $scope.segmentsForm.defaultForm.lineWidth.$error.hasError){
				$scope.segmentsForm.defaultForm.lineWidth.$setValidity('hasError', true);
			}else{
				$scope.segmentsForm.defaultForm.lineWidth.$setValidity('hasError', false);
			}
		}
	};

    $scope.loadProperties = function(){
        switch($scope.tabName){
            case 'position':
                if(angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.stylesSettings) && angular.isDefined($scope.configModel.stylesSettings[$scope.tabName + 's'])){
                    $scope.loadedProperties = {};
                    angular.copy($scope.configModel.stylesSettings[$scope.tabName + 's'], $scope.loadedProperties);
                    $scope.configModel[$scope.tabName + 'Style'] = {};

                    loadPositionOrSegmentProperties();
                    $scope.validateDefaultColor();
                }else{
                    initializeProperties();
                }
                break;
            case 'segment':
                if(angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.stylesSettings) && angular.isDefined($scope.configModel.stylesSettings[$scope.tabName + 's'])){
                    $scope.loadedProperties = {};
                    angular.copy($scope.configModel.stylesSettings[$scope.tabName + 's'], $scope.loadedProperties);
                    $scope.configModel[$scope.tabName + 'Style'] = {};

                    loadLineProperties();
                    loadPositionOrSegmentProperties();
                    $scope.validateDefaultColor();
					$timeout(function() {
						$scope.validateLineWidth();
					}, 100);
                }else{
                    initializeProperties();
                }    
                break;
            case 'alarm':
                loadAlarmProperties();
                break;
        }
    };

    var loadPositionOrSegmentProperties = function(){
        switch ($scope.loadedProperties.attribute) {
                case "reportedSpeed":
                case "calculatedSpeed":
				case "reportedCourse":
				case "speedOverGround":
				case "courseOverGround":
				case "distance":
				case "duration":
					$scope.propertyList = [];
					angular.forEach($scope.loadedProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel[$scope.tabName + 'Style'].defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.propertyList = _.sortBy($scope.propertyList, 'propertyFrom');
					$scope.configModel[$scope.tabName + 'Style'].attribute = $scope.loadedProperties.attribute;
					$scope.configModel[$scope.tabName + 'Style'].style = $scope.propertyList;
					break;
				case "countryCode":
					$scope.configModel[$scope.tabName + 'Style'].attribute = $scope.loadedProperties.attribute;
					break;
                case "activity":
				case "type":
				case "segmentCategory":
					$scope.propertyList = [];
					angular.forEach($scope.loadedProperties.style, function(value,key){
						if(key === "default"){
							$scope.configModel[$scope.tabName + 'Style'].defaultColor = value;
						}else{
							setLoadedRule(value,key);
						}
					});
					$scope.configModel[$scope.tabName + 'Style'].attribute = $scope.loadedProperties.attribute;
					$scope.configModel[$scope.tabName + 'Style'].style = $scope.propertyList;
					break;
				default:
					$scope.configModel[$scope.tabName + 'Style'] = {};
					$scope.configModel[$scope.tabName + 'Style'].style = [];
					$scope.ruleId = _.keys($scope.configModel[$scope.tabName + 'Style'].style).length;
					break;
			}
    };

    var loadLineProperties = function(){
        if($scope.loadedProperties.style.lineStyle !== undefined){
            $scope.configModel.segmentStyle.lineStyle = $scope.loadedProperties.style.lineStyle.toString();
            delete $scope.loadedProperties.style.lineStyle;
        }
        if($scope.loadedProperties.style.lineWidth !== undefined){
            $scope.configModel.segmentStyle.lineWidth = parseInt($scope.loadedProperties.style.lineWidth);
            delete $scope.loadedProperties.style.lineWidth;
        }
    };

    var loadAlarmProperties = function(){
        var alarmDef = $scope.configModel.stylesSettings.alarms;
	    var keys = _.keys(alarmDef);
	    
	    $scope.configModel.alarmStyle = {};
	    var rules = [];
	    for (var i = 0; i < keys.length; i++){
	        if (keys[i] !== 'size'){
	            rules.push({
                    "code": locale.getString('spatial.legend_panel_alarms_' + keys[i]),
                    "color": alarmDef[keys[i]], 
                    "id": keys[i]
                });
	        } else {
	            $scope.configModel.alarmStyle.size = alarmDef[keys[i]];
	        }
	    }
	    $scope.configModel.alarmStyle.style = rules;
    };

    var initializeProperties = function(){
        $scope.configModel = {};
        $scope.configModel[$scope.tabName + 'Style'] = {};
        $scope.configModel[$scope.tabName + 'Style'].style = [];
        $scope.ruleId = _.keys($scope.configModel[$scope.tabName + 'Style'].style).length;
    };


    $scope.getNrErrors = function() {
		var nrErrors = 0;
		if(angular.isDefined($scope[$scope.tabName + 'sForm']) && angular.isDefined($scope[$scope.tabName + 'sForm'].ruleslistForm)){
			angular.forEach($scope.configModel[$scope.tabName + 'Style'].style, function(item){
				if(angular.isDefined($scope[$scope.tabName + 'sForm'].ruleslistForm["rowstylesForm" + item.id])){
					angular.forEach($scope[$scope.tabName + 'sForm'].ruleslistForm["rowstylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}
			});
		}
		return nrErrors;
	};



	$scope.$watch('loadedAllSettings', function() {
		if($scope.loadedAllSettings && $scope.configModel && $scope.configModel.stylesSettings && $scope.configModel.stylesSettings[$scope.tabName + 's'] && ($scope.tabName === 'alarm' || $scope.configModel.stylesSettings[$scope.tabName + 's'].style)){
			$scope.loadProperties();
			if(angular.isDefined($scope.stylesSettingsForm)){
				$scope.stylesSettingsForm.$setPristine();
			}
		}
	});

});