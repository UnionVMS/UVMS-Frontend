angular.module('unionvmsWeb').controller('AlarmstylesCtrl',function($scope,locale,alarmRestService){
	
	$scope.getNrErrors = function() {
		var nrErrors = 0;
		if(angular.isDefined($scope.alarmsForm)){
			angular.forEach($scope.configModel.alarmStyle.style, function(item){
				if(angular.isDefined($scope.alarmsForm["alarmStylesForm" + item.id])){
					angular.forEach($scope.alarmsForm["alarmStylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}else if(angular.isDefined($scope.alarmsForm["rowstylesForm" + item.id])){
					angular.forEach($scope.alarmsForm["rowstylesForm" + item.id].$error, function(item){
						nrErrors += item.length;
					});
				}
			});
		}
		return nrErrors;
	};
	
	$scope.validatePropertyColor = function(item){
		if (angular.isDefined(item) && angular.isDefined($scope.alarmsForm["propertyColor" + item.id])){
			if(item.color && (item.color.length <= 3 || item.color.length > 7 || item.color.indexOf('#') === -1)){
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('segPropColor', false);
			}else{
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('segPropColor', true);
			}
			if(!item.color && item.color !== 0){
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('requiredField', false);
			}else{
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('requiredField', true);
			}
			if($scope.alarmsForm["propertyColor" + item.id].$valid || _.allKeys($scope.alarmsForm["propertyColor" + item.id].$error).length === 1 && $scope.alarmsForm["propertyColor" + item.id].$error.hasError){
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('hasError', true);
			}else{
				$scope.alarmsForm["propertyColor" + item.id].$setValidity('hasError', false);
			}
		}
	};
	
	$scope.loadAlarmProperties = function(){
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
	
	$scope.$watch('loadedAllSettings', function() {
		if($scope.loadedAllSettings && $scope.configModel && $scope.configModel.stylesSettings && $scope.configModel.stylesSettings.alarms){
			$scope.loadAlarmProperties();
			$scope.vmsstylesForm.$setPristine();
		}
	});
});