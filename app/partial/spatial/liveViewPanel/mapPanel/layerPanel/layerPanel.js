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
angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout,$window, mapService, locale){
    $scope.expanded = false;

    $scope.tab = "LAYERTREE";
  
    $scope.toggle = function() {
        $scope.expanded = !$scope.expanded;
        if ($scope.expanded) {
        	$( '#layer-panel-wrapper' ).addClass('expanded');
            $timeout($scope.setHeight, 150);
        }else{
        	$( '#layer-panel-wrapper' ).removeClass('expanded');
        }
        $timeout(mapService.updateMapSize, 50);
    };

    angular.element( $window ).bind( 'resize', function(){
        $timeout($scope.setHeight, 150);
    });

    $scope.tabClick = function( tab ) {
        $scope.tab = tab;
    };

    $scope.setHeight = function() {
    	setTimeout(function() {
	    	var wh = $( '#layer-panel-wrapper' ).height();
	        var th = $( '#layer-tabs-container' ).height()+2;
	        $( '.fancytree-container' ).css( 'height', wh-th+'px' );
    	}, 100);
    };
    
	$('.layer-panel').on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
		mapService.updateMapSize();
    });
    
    angular.element(document).ready(function () {
        if (angular.isDefined(mapService.map)){
            mapService.updateMapContainerSize();
        }
    });
});