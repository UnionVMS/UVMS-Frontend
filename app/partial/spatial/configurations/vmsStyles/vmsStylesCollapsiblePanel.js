angular.module('unionvmsWeb').controller('VmsstylescollapsiblepanelCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService){

	$scope.status = {
		isOpen: false
	};
	
	$scope.selectedMenu = 'POSITIONS';

	var setMenus = function(){
	        return [
	            {
	                'menu': 'POSITIONS',
	                'title': locale.getString('spatial.tab_movements')
	            },
	            {
	                'menu': 'SEGMENTS',
	                'title': locale.getString('spatial.tab_segments')
	            }
	        ];
	    };
	    
	locale.ready('spatial').then(function(){
	   $scope.headerMenus = setMenus();
	});
	
	$scope.selectMenu = function(menu){
	   $scope.selectedMenu = menu;
	};
	
	$scope.isMenuSelected = function(menu){
	   return $scope.selectedMenu === menu;
	};
	
	$scope.reset = function(){
        var item = {
            stylesSettings: {}
        };
        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
    };
    
    var resetSuccess = function(response){
        //TODO check if this is working properly
        $scope.configModel.stylesSettings = response.stylesSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy(response.stylesSettings, $scope.configCopy.stylesSettings);
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