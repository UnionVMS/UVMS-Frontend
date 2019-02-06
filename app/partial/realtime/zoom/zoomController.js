angular.module('unionvmsWeb').controller('ZoomCtrl', function($scope, $rootScope, realtimeMapService, $localStorage, zoomService) {
    $scope.items = [];
    for (var i = 0; i < 5; i++) {
        $scope.items.push(i);
    }

    if ($localStorage['mapZoomLevel'] == null) {
        $localStorage['mapZoomLevel'] = [];
    }

    $scope.saveZoomLevel = function(index) {
        $localStorage['mapZoomLevel'][index] = {
            center: realtimeMapService.getCenter(),
            zoomLevel: realtimeMapService.getZoomLevel()
        };
    };


    $scope.viewZoomLevel = function(index) {
        zoomService.loadZoomLevel(index);
    };
});

