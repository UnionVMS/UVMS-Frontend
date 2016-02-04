angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService, reportService){
    $scope.selectedTab = 'MAP';
    
    //Define tabs
    var setTabs = function(){
            return [
                {
                    'tab': 'MAP',
                    'title': locale.getString('spatial.tab_map'),
                    'visible': reportService.tabs.map
                },
                {
                    'tab': 'VMS',
                    'title': locale.getString('spatial.tab_vms'),
                    'visible': reportService.tabs.vms
                }
            ];
        };
        
   $scope.selectTab = function(tab){
       $scope.selectedTab = tab;
   };
   
   $scope.isTabSelected = function(tab){
       return $scope.selectedTab === tab;
   };
   
   $scope.isTabVisible = function(tabIdx){
       return $scope.tabMenu[tabIdx].visible;
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
           $timeout(mapService.updateMapContainerSize, 100);
           $timeout($scope.focusMap, 50);
       }
   });
   
   $scope.$watch(function(){return reportService.isReportExecuting;}, function(newVal, oldVal){
       $scope.tabMenu[0].visible = reportService.tabs.map;
       $scope.tabMenu[1].visible = reportService.tabs.vms;
       if (reportService.tabs.map === true){
           $scope.selectTab('MAP');
       } else {
           $scope.selectTab('VMS');
       }
   });
   
   $scope.$on('mapAction', function(){
       $scope.selectedTab = 'MAP';
   });
   
   locale.ready('spatial').then(function(){
       $scope.tabMenu = setTabs();
   });
});