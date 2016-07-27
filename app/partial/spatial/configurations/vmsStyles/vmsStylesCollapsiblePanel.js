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
	    
	$scope.checkComponents = function(){
	    var status = false;
        var menuToSelect = [];
        var counter = 0;
        angular.forEach($scope.components.styles, function(value, key) {
            if (!value){
                status = true;
            }
            menuToSelect.push(value);
            counter += 1;
        });
        
        if (status){
            var states = _.countBy(menuToSelect, function(state){return state;});
            if (states.true === 1){
                var idx = _.indexOf(menuToSelect, true);
                if (idx !== -1){
                    $scope.selectedMenu =  $scope.headerMenus[idx].menu;
                }
            }
        }
        
        return status;  
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