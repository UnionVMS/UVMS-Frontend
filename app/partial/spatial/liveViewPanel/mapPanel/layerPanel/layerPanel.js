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
    
    angular.element(document).ready(function () {
    	$scope.resizeMap();
    });
});
