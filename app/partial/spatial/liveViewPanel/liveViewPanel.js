angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService, reportService, genericMapService){
    $scope.selectedTab = 'MAP';
    
   $scope.$watch('repServ.tabs.map', function(newVal, oldVal){
      if (newVal){
          $timeout(mapService.updateMapContainerSize(), 100);
          $timeout(genericMapService.focusMap('map'), 50);
      } 
   });
});