angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService, reportService){
    $scope.selectedTab = 'MAP';
    
   //Focus map div
   $scope.focusMap = function(){
       var mapElement = $window.document.getElementById('map');
       if(mapElement){
           mapElement.focus();
       }
   };
   
   $scope.$watch('repServ.tabs.map', function(newVal, oldVal){
      if (newVal){
          $timeout(mapService.updateMapContainerSize(), 100);
          $timeout($scope.focusMap, 50);
      } 
   });
});