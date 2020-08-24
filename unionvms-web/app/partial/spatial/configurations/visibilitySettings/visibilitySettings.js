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
angular.module('unionvmsWeb').controller('VisibilitysettingsCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location, loadingStatus){

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
                'menu': 'track',
                'title': locale.getString('spatial.tab_tracks')
            }
        ];
    };

    $scope.checkComponents = function(){
        var status = false;
        var menuToSelect = [];
        var counter = 0;
        angular.forEach($scope.components.visibility, function(value, key) {
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

    $scope.selectAll = {
    	positions: {
    		table: {
               values : true
            },
    		popup: {
    		   names : true,
    		   values : true
    		},
    		label: {
               names : true,
               values : true
            }
    	},
    	segments: {
    		table: {
               values : true
            },
            popup: {
                names : true,
                values : true
            },
            label: {
                names : true,
                values : true
            }
    	},
    	tracks: {
    		table: {
                values : true
            }
    	}
    };

    locale.ready('spatial').then(function(){
       $scope.headerMenus = setMenus();
    });

    $scope.selectMenu = function(menu){
       $scope.selectedMenu = menu;
    };

    $scope.dropItem = function(item, list){
 	   var itemIndex = list.indexOf(item);
 	   if(itemIndex !== 1){
 		   list.splice(itemIndex, 1);
 	   }
 	   return item;
    };

    $scope.isDisabledName = function(visibilityType,contentType,name) {
       return !$scope.configModel.visibilitySettings[visibilityType][contentType].values.includes(name);
    };

    $scope.isAllNamesDisabled = function(visibilityType,contentType) {
        return $scope.configModel.visibilitySettings[visibilityType][contentType].values.length === 0;
    };

    $scope.onListItemChange = function(columnType,visibilityType,contentType){
        var contentTypeLocal = contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase();
        var currentVisibilities = $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal];
        var checked = this.checked === true ? 1 : -1;

        if(columnType === 'values'){
    		if(angular.isDefined(currentVisibilities.values) && currentVisibilities.values.length + checked === currentVisibilities.order.length){
    			$scope.selectAll[visibilityType][contentType].values = true;
    		}else{
    			$scope.selectAll[visibilityType][contentType].values = false;
    		}

            if(angular.isDefined($scope.configModel.visibilitySettings[visibilityType][contentTypeLocal].names)){
                if(checked === -1) {
                    var itemIndex = $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal].names.indexOf(this.$parent.attr.value);
                    if(itemIndex !== -1){
                        $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal].names.splice(itemIndex, 1);
                    }
                }
                var valuesLength = currentVisibilities.values.length + checked;
                if(angular.isDefined(currentVisibilities.names) && currentVisibilities.names.length === valuesLength && valuesLength > 0){
                    $scope.selectAll[visibilityType][contentType].names = true;
                }else{
                    $scope.selectAll[visibilityType][contentType].names = false;
                }
            }
        }
        else{
            if(angular.isDefined(currentVisibilities.names) && currentVisibilities.names.length + checked === currentVisibilities.values.length){
                $scope.selectAll[visibilityType][contentType].names = true;
            }else{
                $scope.selectAll[visibilityType][contentType].names = false;
            }
        }
    };

    $scope.selectAllNamesChange = function(visibilityType,contentType,newVal){
    	var contentTypeLocal = contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase();
    	var currentVisibilities = $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal];
    	currentVisibilities.names = [];
    	if($scope.selectAll[visibilityType][contentType].names){
    	    angular.forEach(currentVisibilities.values, function(item) {
    		    currentVisibilities.names.push(item);
    		});
    	}
    };
	$scope.selectAllChange = function(visibilityType,contentType,newVal){
	    var contentTypeLocal = contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase();
		var currentVisibilities = $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal];
    	currentVisibilities.values = [];
		if($scope.selectAll[visibilityType][contentType].values){
			angular.forEach(currentVisibilities.order, function(item) {
				currentVisibilities.values.push(item);
			});
		}
		else{
		    $scope.selectAll[visibilityType][contentType].names = this.checked;
            $scope.configModel.visibilitySettings[visibilityType][contentTypeLocal].names = [];
		}
	};
});

