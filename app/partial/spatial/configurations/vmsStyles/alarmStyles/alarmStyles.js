angular.module('unionvmsWeb').controller('AlarmstylesCtrl',function($scope,locale,alarmRestService){
	
	$scope.validateDefaultColor = function(){
		if(angular.isDefined($scope.alarmsForm) && angular.isDefined($scope.alarmsForm.defaultForm) && angular.isDefined($scope.alarmsForm.defaultForm.defaultColor)){
			if($scope.configModel.alarmStyle.defaultColor && ($scope.configModel.alarmStyle.defaultColor.length <= 3 || $scope.configModel.alarmStyle.defaultColor.length > 7 || $scope.configModel.alarmStyle.defaultColor.indexOf('#') === -1)){
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('segDefColor', false);
			}else{
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('segDefColor', true);
			}
			if(!$scope.configModel.alarmStyle.defaultColor && $scope.configModel.alarmStyle.defaultColor !== 0){
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('requiredField', false);
			}else{
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('requiredField', true);
			}
			if($scope.alarmsForm.defaultForm.defaultColor.$valid || _.allKeys($scope.alarmsForm.defaultForm.defaultColor.$error).length === 1 && $scope.alarmsForm.defaultForm.defaultColor.$error.hasError){
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('hasError', true);
			}else{
				$scope.alarmsForm.defaultForm.defaultColor.$setValidity('hasError', false);
			}
		}
	};
	
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
	
	
//	alarmRestService.getTicketStatusConfig().then(function(value) {
//		
//	}, function(err) {
//		console.log.error(err);
//	};
	
	$scope.$watch('loadedAllSettings', function() {
		if($scope.loadedAllSettings && $scope.configModel && $scope.configModel.stylesSettings){// && $scope.configModel.stylesSettings.alarms && $scope.configModel.stylesSettings.alarms.style){
//			$scope.loadAlarmProperties();
			$scope.configModel.alarmStyle = {};
			$scope.configModel.alarmStyle.style = [
			                                       {"code": "TEST1", "color": "#ddd", "id": "0"},
			                                       {"code": "TEST2", "color": "#fff", "id": "1"}
			                                       ];
			
		}
	});
});