/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
