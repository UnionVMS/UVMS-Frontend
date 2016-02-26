angular.module('unionvmsWeb').controller('ConfigurationreportingCtrl',function($scope, locale, SpatialConfig, spatialConfigRestService, alertService, $anchorScroll){
	$scope.isAdminConfig = true;
	$scope.save = function(){
    	if(_.keys($scope.configurationReportForm.$error).length === 0){
	        var finalConfig = $scope.configModel.forAdminConfigToJson($scope.configModel);
	        spatialConfigRestService.saveAdminConfigs(finalConfig).then(function(response){
	            alertService.showSuccessMessageWithTimeout(locale.getString('common.global_setting_save_success_message'));
	        }, function(error){
	            alertService.showErrorMessageWithTimeout(locale.getString('common.global_setting_save_error_message'));
	        });
    	}else{
    		$anchorScroll();
    		alertService.showErrorMessageWithTimeout(locale.getString('spatial.invalid_data_saving'));
		    $scope.submitedWithErrors = true;
    	}
    };
});