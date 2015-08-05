angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService){
    $scope.selectedMenu = 'LIVEVIEW';
    
    //Define header menus
    var setMenus = function(){
            return [
                {
                    'menu': 'LIVEVIEW',
                    'title': locale.getString('spatial.header_live_view')
                },
                {
                    'menu': 'REPORTS',
                    'title': locale.getString('spatial.header_reports')
                }
            ];
        };
        
   locale.ready('spatial').then(function(){
       $scope.headerMenus = setMenus();
   });
   
   $scope.selectMenu = function(menu){
       $scope.selectedMenu = menu;
   };
   
   $scope.isMenuSelected = function(menu){
       return $scope.selectedMenu === menu;
   };
   
   //Refresh map size on menu change
   $scope.$watch('selectedMenu', function(newVal, oldVal){
       if (newVal === 'LIVEVIEW'){
           $timeout(mapService.updateMapSize, 50);
       } else {
           $scope.$broadcast('loadReportsList');
       }
   });
   
   //Change tab to liveview when a user has clicked in run report in the reports page
   $scope.$on('runReport', function(event, report){
      $scope.selectMenu('LIVEVIEW');
      $scope.headerMenus[0].title = report.name;
   });
});