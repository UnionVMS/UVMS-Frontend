/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('ConfigurationreportingCtrl',function($scope, locale, SpatialConfig, spatialConfigRestService, alertService, $anchorScroll, loadingStatus){
	$scope.settingsLevel = 'admin';
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