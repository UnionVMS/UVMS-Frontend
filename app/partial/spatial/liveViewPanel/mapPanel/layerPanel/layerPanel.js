angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout,$window, mapService, locale){
    $scope.expanded = false;

    $scope.tab = "LAYERTREE";
  
    $scope.toggle = function() {
        $scope.expanded = !$scope.expanded;
        if ($scope.expanded) {
            $timeout($scope.setHeight, 150);
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
    
    $scope.resizeMap = function(evt) {
    	
        var w = angular.element(window);
        
        if(evt && (angular.element('.mapPanelContainer.fullscreen').length > 0 ||
        		(angular.element('.mapPanelContainer.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){
        	
        	setTimeout(function() {
        		$('.map-container').css('height', w.height() - parseInt($('.map-bottom').css('height')) + 'px');
        		$('.layer-panel').css('height', w.height() - parseInt($('#map-toolbar').css('height')) + 'px');
                $('#map').css('height', w.height() - parseInt($('#map-toolbar').css('height')) - parseInt($('.map-bottom').css('height')) + 'px');
                mapService.updateMapSize();
        	}, 100);
      	  return;
        }
        
        setTimeout(function() {
	        var offset = 120;
	        var minHeight = 340;
	        var footerHeight = angular.element('footer')[0].offsetHeight;
	        var headerHeight = angular.element('header')[0].offsetHeight;
	        var newHeight = w.height() - headerHeight - footerHeight - offset;
	        
	        if (newHeight < minHeight) {
	            newHeight = minHeight;
	        }
	        
	        $('.map-container').css('height', newHeight);
	        $('.layer-panel').css('height', newHeight);

	        var mapToolbarHeight = parseInt($('#map-toolbar').css('height'));
	        if(mapToolbarHeight > 31){
	        	$('#map').css('height', newHeight - (mapToolbarHeight - 31) - parseInt($('.map-bottom').css('height')) + 'px');
	        }else{
	        	$('#map').css('height', newHeight - parseInt($('.map-bottom').css('height')) + 'px');
	        }
	        
	        mapService.updateMapSize();
        }, 100);
  	};
    
    angular.element(document).ready(function () {
    	$scope.resizeMap();
    });
});
