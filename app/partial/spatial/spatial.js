angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService, reportRestService, reportService, $anchorScroll){
    $scope.isMenuVisible = true;
    $scope.selectedMenu = 'LIVEVIEW';
    $scope.reports = [];
    $scope.executedReport = {};
    $scope.repServ = reportService;
    
    //reset repServ
    $scope.repServ.clearVmsData();
    
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
   
   //Report filter definitions
   $scope.editReport = function(){
	   if(!$scope.repServ.outOfDate){
		   $scope.repServ.isReportExecuting = true;
	       reportRestService.getReport($scope.repServ.id).then(getReportSuccess, getReportError);
	   }else{
		   $scope.$broadcast('goToReportForm','EDIT-FROM-LIVEVIEW');
		   $scope.selectMenu('REPORTS');
	   }
   };
   
   //Get Report Configs Success callback
   var getReportSuccess = function(response){
	   $scope.repServ.isReportExecuting = false;
	   $scope.$broadcast('openReportForm', {'report': response});
       $scope.$broadcast('goToReportForm','EDIT-FROM-LIVEVIEW');
       $scope.selectMenu('REPORTS');
   };
	   
   //Get Report Configs Failure callback
   var getReportError = function(error){
	   $scope.repServ.isReportExecuting = false;
       $anchorScroll();
       $scope.alert.show(locale.getString('spatial.error_entry_not_found'), 'error');
   };
   
   //Refresh map size on menu change
   $scope.$watch('selectedMenu', function(newVal, oldVal){
       if (newVal === 'LIVEVIEW'){
           $timeout(mapService.updateMapSize, 100);
           mapService.updateMapContainerSize();  
           reportService.isLiveViewActive = true;   
       } else if  (newVal === 'REPORTS'){
           if ($scope.reports.length === 0){
               $scope.$broadcast('loadReportsList');
           }
           $scope.$broadcast('untoggleToolbarBtns');
           reportService.isLiveViewActive = false;
       }else {
    	   $scope.$broadcast('loadUserPreferences', oldVal);
         reportService.isLiveViewActive = false;
       }
   });
   
   //Change tab to liveview when a user has clicked in run report in the reports page
   $scope.$on('runReport', function(event, report){
       $scope.selectMenu('LIVEVIEW');
       $scope.headerMenus[0].title = report.name;
       //Getting report data
       reportService.runReport(report);
   });
   
   $scope.$on('closeUserPreferences', function(event, lastSelected){
       $scope.selectMenu(lastSelected);
   });
   
   $scope.$on('goToLiveView', function(event, lastSelected){
	   $scope.selectMenu('LIVEVIEW');
   });
   
});