angular.module('unionvmsWeb').controller('MapsettingscollapsiblepanelCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService){

	$scope.status = {
		isOpen: false
	};
	
	$scope.reset = function(){
	    var item = {
	       mapSettings: {}
	    };
	    spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
	};
	
	var resetSuccess = function(response){
	    $scope.configModel.mapSettings = response.mapSettings;
	    if (angular.isDefined($scope.configCopy)){
	        angular.copy(response.mapSettings, $scope.configCopy.mapSettings);
	    }
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_success');
        spatialConfigAlertService.hideAlert();
	};
	
	var resetFailure = function(error){
	    $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_failure');
        spatialConfigAlertService.hideAlert();
	};
});