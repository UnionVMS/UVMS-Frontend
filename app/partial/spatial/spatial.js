angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService, spatialHelperService, reportRestService, reportService, $anchorScroll, userService, loadingStatus, $state, $localStorage, comboboxService, reportingNavigatorService, $compile, $modal){
    $scope.reports = [];
    $scope.executedReport = {};
    $scope.repServ = reportService;
    $scope.loadingStatus = loadingStatus;
    $scope.currentContext = userService.getCurrentContext();
    $scope.comboServ = comboboxService;
    $scope.repNav = reportingNavigatorService;
    $scope.repNav.clearNavigation();
    
    //reset repServ
    $scope.repServ.clearVmsData();
    
   locale.ready('spatial').then(function(){
       //reset the map and remove references to it
       if (angular.isDefined(mapService.map)){
           mapService.map.setTarget(null);
           mapService.map = undefined;
       }
       
       $scope.curState = $state.current.name;
       if($state.current.name === 'app.reporting-id'){
    	   spatialHelperService.tbControl.newTab = false;
           $scope.repServ.isReportExecuting = true;
           loadingStatus.isLoading('LiveviewMap',true);
           
           if(angular.isDefined($localStorage['report'+$state.params.id + '-' + $state.params.guid])){
        	   reportService.runReportWithoutSaving($localStorage['report' + $state.params.id + '-' + $state.params.guid]);
        	   delete $localStorage['report'+$state.params.id + '-' + $state.params.guid];
           }else{
	           reportRestService.getReport($state.params.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               $scope.repServ.isReportExecuting = false;
	               $scope.repServ.errorLoadingDefault = true;
	           });
           }
       }else{
	       //let's check for the existence of default reports
	       var defaultRepObj = spatialHelperService.getDefaultReport(true);
	       if (angular.isDefined(defaultRepObj) && !_.isNaN(defaultRepObj.id) && defaultRepObj.id !== 0){
	           $scope.repServ.isReportExecuting = true;
	           loadingStatus.isLoading('LiveviewMap',true);
	           reportRestService.getReport(defaultRepObj.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               $scope.repServ.isReportExecuting = false;
	               $scope.repServ.errorLoadingDefault = true;
	           });
	       }else{
               reportRestService.getReportsList().then(function(response){
                   if(response.data.length){
                       $scope.repServ.loadReportHistory();
                       $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList,[undefined,true]);
                   }else{
                       $scope.openNewReport();
                   }
               }, function(error){
                   //TODO msg error
               });
               
           }
       }
   });
   
   $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
   };
   
   //Report filter definitions
   $scope.editReport = function(){
	   $scope.repServ.isReportExecuting = true;
	   if(!$scope.repServ.outOfDate){
	       reportRestService.getReport($scope.repServ.id).then(getReportSuccess, getReportError);
	   }else{
            $scope.formMode = 'EDIT-FROM-LIVEVIEW';
            $scope.repNav.goToView('reportsPanel','reportForm');
            $scope.repServ.isReportExecuting = false;
	   }
   };

   //Create new report from liveview
   $scope.createReportFromLiveview = function(evt){
       $scope.comboServ.closeCurrentCombo(evt);
       $scope.formMode = 'CREATE';
       $scope.repNav.goToView('reportsPanel','reportForm');
   };
   
   //Get Report Configs Success callback
   var getReportSuccess = function(response){
       $scope.loadReportEditing('EDIT-FROM-LIVEVIEW',response);
   };
	   
   //Get Report Configs Failure callback
   var getReportError = function(error){
	   $scope.repServ.isReportExecuting = false;
       $anchorScroll();
       $scope.repServ.alertType = 'danger';
       $scope.repServ.hasAlert = true;
       $scope.repServ.message = locale.getString('spatial.error_entry_not_found');
   };
   
   $scope.selectHistory = function(item){
        var report = angular.copy(item);
        delete report.code;
        delete report.text;
        $scope.repServ.runReport(report);
    };

    $scope.initComboHistory = function(comboId){
        var comboFooter = angular.element('<li class="combo-history-footer"><div class="footer-item" ng-click="openReportList($event)"><span>Edit List</span></div><div class="footer-item" ng-click="createReportFromLiveview($event)"><span>Create new</span></div></li>');
        angular.element('#' + comboId + '>.dropdown-menu').append(comboFooter);
        $compile(comboFooter)($scope);
    };

    $scope.openReportList = function(evt,reportsListLoaded){
        $scope.comboServ.closeCurrentCombo(evt);
        $scope.repNav.addStateCallback($scope.openReportList);
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportsListModal/reportsListModal.html',
            controller: 'ReportslistmodalCtrl',
            size: 'lg',
            resolve: {
                reportsListLoaded: function(){
                    return reportsListLoaded;
                }
            }
        });

        modalInstance.result.then(function(data){
            if(data.action === 'CREATE'){
                $scope.openNewReport();
            }else if(data.action === 'EDIT'){
                $scope.repServ.isReportExecuting = true;
                $scope.loadReportEditing('EDIT',data.report);
            }
        });
    };

    $scope.openNewReport = function(){
        $scope.formMode = 'CREATE';
        $scope.repNav.goToView('reportsPanel','reportForm');
    };

    $scope.loadReportEditing = function(mode,report){
        $scope.formMode = mode;
        $scope.reportToLoad = report;
        $scope.repNav.goToView('reportsPanel','reportForm');
        $scope.repServ.isReportExecuting = false;
    };
});