angular.module('unionvmsWeb').controller('VmsstylescollapsiblepanelCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location, loadingStatus){

	$scope.status = {
		isOpen: false
	};
	
	$scope.selectedMenu = 'position';

	var setMenus = function(){
	        return [
	            {
	                'menu': 'position',
	                'title': locale.getString('spatial.tab_movements')
	            },
	            {
	                'menu': 'segment',
	                'title': locale.getString('spatial.tab_segments')
	            },
	            {
	            	'menu': 'alarm',
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
    
    $scope.generateRandomColor = function(){
		var color = "#";
	    var possible = "0123456789";
	    for( var i=0; i < 6; i++ ){
	        color += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return color;
	};
	
});