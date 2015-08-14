angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService){
    $scope.selectedTab = 'VMS';
    
    //Define tabs
    var setTabs = function(){
            return [
                {
                    'tab': 'MAP',
                    'title': locale.getString('spatial.tab_map')
                },
                {
                    'tab': 'VMS',
                    'title': locale.getString('spatial.tab_vms')
                }
            ];
        };
        
   $scope.selectTab = function(tab){
       $scope.selectedTab = tab;
   };
   
   $scope.isTabSelected = function(tab){
       return $scope.selectedTab === tab;
   };
   
   //Focus map div
   $scope.focusMap = function(){
       var mapElement = $window.document.getElementById('map');
       if(mapElement){
           mapElement.focus();
       }
   };
   
   //Refresh map size on tab change
   $scope.$watch('selectedTab', function(newVal, oldVal){
       if (newVal === 'MAP'){
           $timeout(mapService.updateMapSize, 50);
           $timeout($scope.focusMap, 50);
       }
   });
   
   locale.ready('spatial').then(function(){
       $scope.tabMenu = setTabs();
   });
});