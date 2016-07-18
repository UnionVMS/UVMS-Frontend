angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService, reportService, genericMapService){
   $scope.$watch('repNav.isViewVisible("mapPanel")', function(newVal, oldVal){
      if (newVal){
          $timeout(mapService.updateMapContainerSize(), 100);
          $timeout(genericMapService.focusMap('map'), 50);
      } 
   });
});