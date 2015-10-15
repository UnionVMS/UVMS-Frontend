angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService, reportRestService, reportService){
    $scope.isMenuVisible = true;
    $scope.selectedMenu = 'LIVEVIEW';
    $scope.reports = [];
    $scope.executedReport = {};
    
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
   
   $scope.toggleMenuVisibility = function(){
       $scope.isMenuVisible = !$scope.isMenuVisible;
   };
   
   //Refresh map size on menu change
   $scope.$watch('selectedMenu', function(newVal, oldVal){
       if (newVal === 'LIVEVIEW'){
           $timeout(mapService.updateMapSize, 100);
       } else {
           if ($scope.reports.length === 0){
               $scope.$broadcast('loadReportsList');
           }
       }
   });
   
   //Change tab to liveview when a user has clicked in run report in the reports page
   $scope.$on('runReport', function(event, report){
      $scope.selectMenu('LIVEVIEW');
      $scope.headerMenus[0].title = report.name;
      //Getting report data
      reportService.runReport(report);
   });
   
});