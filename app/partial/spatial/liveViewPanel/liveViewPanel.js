angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService){
    $scope.selectedTab = 'MAP';
    
    //Define tabs
    var setTabs = function(){
            return [
                {
                    'tab': 'MAP',
                    'title': locale.getString('spatial.tab_map'),
                    'visible': true
                },
                {
                    'tab': 'VMS',
                    'title': locale.getString('spatial.tab_vms'),
                    'visible': true
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
   
   $scope.$on('mapAction', function(){
       $scope.selectedTab = 'MAP';
   });
   
   locale.ready('spatial').then(function(){
       $scope.tabMenu = setTabs();
   });
});