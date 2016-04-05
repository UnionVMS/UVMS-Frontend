angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService, reportRestService, reportService, $anchorScroll, userService, loadingStatus){
    $scope.isMenuVisible = true;
    $scope.selectedMenu = 'REPORTS';
    $scope.reports = [];
    $scope.executedReport = {};
    $scope.repServ = reportService;
    $scope.loadingStatus = loadingStatus;
    $scope.currentContext = userService.getCurrentContext();
    
    //reset repServ
    $scope.repServ.clearVmsData();
    $scope.repServ.name = locale.getString('spatial.header_live_view');
    $scope.repServ.liveviewEnabled = false;
    
    //Define header menus
    var setMenus = function(){
        return [
            {
                'menu': 'LIVEVIEW',
                'title': $scope.repServ.name,
                'visible': $scope.repServ.liveviewEnabled
            },
            {
                'menu': 'REPORTS',
                'title': locale.getString('spatial.header_reports'),
                'visible': true
            }
        ];
    };
        
   locale.ready('spatial').then(function(){
       //reset the map and remove references to it
       if (angular.isDefined(mapService.map)){
           mapService.map.setTarget(null);
           mapService.map = undefined;
       }
       
       //let's check for the existence of default reports
       var defaultReportId = $scope.findDefaultReport();
       if (angular.isDefined(defaultReportId) && !_.isNaN(defaultReportId)){
           var useId;
           if (defaultReportId !== 0 && !angular.isDefined($scope.repServ.defaultReportId)){
               useId = defaultReportId;
           } else if ($scope.repServ.defaultReportId !== 0){
               useId = $scope.repServ.defaultReportId;
           }
           
           if (angular.isDefined(useId)){
               $scope.repServ.defaultReportId = useId;
               $scope.selectedMenu = 'LIVEVIEW';
               $scope.repServ.liveviewEnabled = true;
               $scope.repServ.isReportExecuting = true;
               loadingStatus.isLoading('LiveviewMap',true);
               reportRestService.getReport(useId).then(function(response){
                   $scope.repServ.runReport(response);
               }, function(error){
                   $scope.selectedMenu = 'REPORTS';
                   $scope.repServ.liveviewEnabled = false;
                   $scope.repServ.isReportExecuting = false;
                   $scope.repServ.hasError = true;
                   $scope.repServ.errorLoadingDefault = true;
                   $timeout(function(){
                       $scope.repServ.hasError = false;
                       $scope.repServ.errorLoadingDefault = false;
                   }, 8000);
               });
           }
       }
       $scope.headerMenus = setMenus();
   });
   
   $scope.findDefaultReport = function(){
       var context = userService.getCurrentContext();
       var userPref = context.preferences;
       
       var defaultId;
       if (angular.isDefined(userPref)){
           angular.forEach(userPref.preferences, function(obj) {
               if (obj.applicationName === 'Reporting' && obj.optionName === 'DEFAULT_REPORT_ID'){
                   defaultId = parseInt(obj.optionValue); 
               }
           });
       }

       return defaultId;
   };
   
   $scope.selectMenu = function(menu){
       $scope.selectedMenu = menu;
   };
   
   $scope.isMenuSelected = function(menu){
       return $scope.selectedMenu === menu;
   };
   
   $scope.toggleMenuVisibility = function(){
       $scope.isMenuVisible = !$scope.isMenuVisible;
   };
   
   $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
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
	   response.isFromLiveView = true;
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
           $scope.repServ.isLiveViewActive = true;   
       } else if  (newVal === 'REPORTS'){
           if ($scope.reports.length === 0){
               $scope.$broadcast('loadReportsList');
           }
           $scope.$broadcast('untoggleToolbarBtns');
           $scope.repServ.isLiveViewActive = false;
       }else {
    	   $scope.$broadcast('loadUserPreferences', oldVal);
    	   $scope.repServ.isLiveViewActive = false;
       }
   });
   
   //Change tab to liveview when a user has clicked in run report in the reports page
   $scope.$on('runReport', function(event, report){
       $scope.selectMenu('LIVEVIEW');
       //Getting report data
       $scope.repServ.runReport(report);
   });
   
   $scope.$watch(function(){return $scope.repServ.name;}, function(newValue, oldValue){
       if (newValue !== oldValue){
           $scope.headerMenus[0].title = newValue;
       }
   });
   
   $scope.$watch(function(){return $scope.repServ.liveviewEnabled;}, function(newValue, oldValue){
       if (newValue !== oldValue){
           $scope.headerMenus[0].visible = newValue;
       }
   });
   
   $scope.$on('closeUserPreferences', function(event, lastSelected){
       $scope.selectMenu(lastSelected);
   });
   
   $scope.$on('goToLiveView', function(event, lastSelected){
	   $scope.selectMenu('LIVEVIEW');
   });
});