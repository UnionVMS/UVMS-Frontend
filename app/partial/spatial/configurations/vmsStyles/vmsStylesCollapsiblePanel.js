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
	            },
	            {
	            	'menu': 'ALARMS',
	                'title': locale.getString('spatial.tab_alarms')
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
		$scope.loadedAllSettings = false;
        var item = {
            stylesSettings: {}
        };
        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
    };
    
    var resetSuccess = function(response){
        //TODO check if this is working properly
        $scope.configModel.stylesSettings = response.stylesSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy($scope.configModel.stylesSettings, $scope.configCopy.stylesSettings);
	        $scope.loadedAllSettings = true;
	        $scope.$broadcast('loadCountries');
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
    
    $scope.generateRandomColor = function(){
		var color = "#";
	    var possible = "0123456789";
	    for( var i=0; i < 6; i++ ){
	        color += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return color;
	};

});