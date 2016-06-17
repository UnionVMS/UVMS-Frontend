angular.module('unionvmsWeb').controller('ConfigurationreportingCtrl',function($scope, locale, SpatialConfig, spatialConfigRestService, alertService, $anchorScroll, loadingStatus){
	$scope.isAdminConfig = true;
	$scope.save = function(){
    	if(_.keys($scope.configurationReportForm.$error).length === 0){
    		loadingStatus.isLoading('SavePreferences',true);
	        var finalConfig = $scope.configModel.forAdminConfigToJson($scope.configurationReportForm);
	        spatialConfigRestService.saveAdminConfigs(finalConfig).then(function(response){
	        	$anchorScroll();
	            alertService.showSuccessMessageWithTimeout(locale.getString('common.global_setting_save_success_message'));
	            loadingStatus.isLoading('SavePreferences',false);
	        }, function(error){
	        	$anchorScroll();
	            alertService.showErrorMessageWithTimeout(locale.getString('common.global_setting_save_error_message'));
	            loadingStatus.isLoading('SavePreferences',false);
	        });
    	}else{
    		$anchorScroll();
    		alertService.showErrorMessageWithTimeout(locale.getString('spatial.invalid_data_saving'));
		    $scope.submitedWithErrors = true;
    	}
    };
});