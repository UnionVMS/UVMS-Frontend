angular.module('unionvmsWeb').factory('reportMsgService', function($timeout){
    var alert = {
        visible: false,
        type: '',
        msg: ''
    };
    
    alert.show = function(msg, type, time){
        var obj = this;
        this.msg = msg;
        this.visible = true;
        this.type = type;
        var timeout = 3000;
        if (angular.isDefined(time)){
            timeout = time;
        }
        $timeout(function(){
            obj.hide();
        }, timeout, true, obj);
    };
    
    alert.hide = function(){
        this.visible = false;
        this.type = '';
        this.msg = '';
    };
    
    return alert;
});

angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, $filter, globalSettingsService, reportMsgService, $anchorScroll, locale, reportRestService, confirmationModal, reportService, spatialHelperService, $state, $window, userService){
    //config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: globalSettingsService.getDateFormat()
    };
    
    $scope.repServ = reportService;

    $scope.repServ.isLoadingReportsList = true;
    $scope.tableAlert = reportMsgService;
    
    $scope.repServ.reportsList = [];
    $scope.reportTableInstance = {};
    $scope.searchString = '';
    
    $scope.removeDefaultTooltip = locale.getString('spatial.reports_table_remove_default_label');
    $scope.makeDefaultTooltip = locale.getString('spatial.reports_table_make_default_label');
    
    //General table configuration
    
    $scope.itemsByPage = 13;
    
    $scope.displayedRecords = [].concat($scope.repServ.reportsList);
    
    //Run the report
    $scope.runReport = function(index){
        var record = $scope.displayedRecords[index];
        reportService.id = $scope.displayedRecords[index].id;
        $scope.repServ.runReport(record);
        $scope.cancel();
    };
    
    //Report filter definitions
    $scope.showFilters = function(index){
        $scope.repServ.isLoadingReportsList = true;
        reportRestService.getReport($scope.displayedRecords[index].id).then(getReportSuccess, getReportError);
    };
    

    //decides whether share button is needed
    $scope.isReportShareable = function (shareable) {
        if (angular.isDefined(shareable) && shareable.length >0) {
            return true;
        } else {
            return false;
        }
    };
    
    //Set default report
    $scope.makeDefault = function(index){
        var repId = $scope.displayedRecords[index].id;
        var scopeRepObj = spatialHelperService.getDefaultReport(false);
        if (angular.isDefined(scopeRepObj) && !isNaN(scopeRepObj.id) && scopeRepObj.id !== 0){
            var options, finalRepId;
            if (scopeRepObj.id !== repId){
                options = {
                    textLabel : locale.getString("spatial.reports_set_default_report_confirmation_text_1") + $scope.displayedRecords[index].name.toUpperCase()  + locale.getString("spatial.reports_set_default_report_confirmation_text_2")
                };
                finalRepId = repId;
            } else {
                options = {
                    textLabel : locale.getString("spatial.reports_set_default_report_confirmation_text_3") + $scope.displayedRecords[index].name.toUpperCase()  + locale.getString("spatial.reports_set_default_report_confirmation_text_4")
                };
                finalRepId = 0;
            }
            confirmationModal.open(function(){
                $scope.repServ.isLoadingReportsList = true;
                reportRestService.setDefaultReport(finalRepId, true).then(setDefaultSuccess, setDefaultError);
            }, options);
        } else {
            $scope.repServ.isLoadingReportsList = true;
            reportRestService.setDefaultReport(repId, true).then(setDefaultSuccess, setDefaultError);
        }
    };
    
    $scope.setDefaultRepLocally = function(id, status){
        var rec = $filter('filter')($scope.repServ.reportsList, {id: id})[0];
        if (angular.isDefined(rec)){
            rec.isDefault = status;
        }
    };
    
    var setDefaultSuccess = function(response){
        $scope.repServ.isLoadingReportsList = false;
        
        //first check if there was a default report and set isDefault to false
        var defRep = spatialHelperService.getDefaultReport(false);
        if (angular.isDefined(defRep) && defRep.id !== 0){
            $scope.setDefaultRepLocally(defRep.id, false);
        }
        
        var infoText = 'spatial.reports_remove_default_report_success';
        if (response.defaultId !== 0){
            $scope.setDefaultRepLocally(response.defaultId, true);
            infoText = 'spatial.reports_set_default_report_success';
        }
        
        spatialHelperService.setDefaultRep(response.defaultId);
        $scope.tableAlert.type = 'success';
        $scope.tableAlert.msg = infoText;
        $scope.tableAlert.visible = true;
    }; 
    
    var setDefaultError = function(error){
        $scope.repServ.isLoadingReportsList = false;
        $scope.tableAlert.type = 'error';
        $scope.tableAlert.msg = 'spatial.reports_set_default_report_error';
        $scope.tableAlert.visible = true;
    };

    //Share report
    $scope.shareReport = function(index, visibility){ 
        var options = {
            textLabel : locale.getString("spatial.reports_share_report_confirmation_text") + $scope.displayedRecords[index].name.toUpperCase()  + '?'
        };
        confirmationModal.open(function(){
            reportRestService.shareReport($scope.displayedRecords[index].id, visibility, index).then(refreshSharedReport, $scope.repServ.getReportsListError);
        }, options);    
    };

    var refreshSharedReport = function(response){
        var index = $scope.repServ.reportsList.indexOf($scope.displayedRecords[response.reportIdx]);
       
        if (index !== -1) {
            $scope.repServ.reportsList[index].shareable = response.data;
            $scope.repServ.reportsList[index].visibility = response.visibility;      
        }

        $scope.repServ.isLoadingReportsList = false;
        $anchorScroll();
    };

    //Delete report
    $scope.deleteReport = function(index){
        var options = {
            textLabel : locale.getString("spatial.reports_delete_report_confirmation_text") + $scope.displayedRecords[index].name.toUpperCase() + '?'
        };
        confirmationModal.open(function(){
            reportRestService.deleteReport($scope.displayedRecords[index].id, index).then(deleteReportSuccess, deleteReportError);
        }, options);
    };
    
    $scope.$watch(function(){return $scope.repServ.errorLoadingDefault;}, function(newVal, oldVal){
        if (newVal){
            $scope.tableAlert.type = 'error';
            $scope.tableAlert.msg = 'spatial.map_error_loading_default_report';
            $scope.tableAlert.visible = true;
        }
    });
    
   //Get Report Configs Success callback
    var getReportSuccess = function(response){
        $scope.repServ.isLoadingReportsList = false;
        $scope.openReportForm('EDIT',response);
    };
    
    //Get Report Configs Failure callback
    var getReportError = function(error){
        $scope.repServ.isLoadingReportsList = false;
        $anchorScroll();
        $scope.tableAlert.type = 'error';
        $scope.tableAlert.msg = 'spatial.error_entry_not_found';
        $scope.tableAlert.visible = true;
    };
    
    //Delete report Success callback
    var deleteReportSuccess = function(resp){
    	var index = $scope.repServ.reportsList.indexOf($scope.displayedRecords[resp.index]);
    	
    	//Check if report is the current liveview report and if so remova data
    	var rep = $scope.displayedRecords[resp.index];
    	if ($scope.repServ.id === rep.id){
    	    $scope.repServ.resetReport();
    	    $scope.repServ.liveviewEnabled = false;
    	}
    	
        if (index !== -1) {
            $scope.repServ.reportsList.splice(index, 1);
        }
        $scope.repServ.isLoadingReportsList = false;
        $anchorScroll();
        $scope.tableAlert.type = 'success';
        $scope.tableAlert.msg = 'spatial.success_delete_report';
        $scope.tableAlert.visible = true;
    };
    
    //Delete report Failure callback
    var deleteReportError = function(error){
        $scope.repServ.isLoadingReportsList = false;
        $anchorScroll();
        var searchString = 'spatial.' + error.msg;
        $scope.tableAlert.type = 'error';
        $scope.tableAlert.msg = searchString;
        $scope.tableAlert.timeout = 8000;
        $scope.tableAlert.visible = true;
    };
    
    //Finally we check if we should automatically load reports
    if (!$scope.reportsListLoaded){
        $scope.repServ.loadReportList();
    }
    
    $scope.openMapOnNewTab = function(repId){
        if (!angular.isDefined(repId)){
            repId = $scope.repServ.id;
        }
    	var guid = generateGUID();
    	var url = $state.href('app.reporting-id', {id: repId, guid: guid});
    	$window.open(url,'_blank');
    };

    function generateGUID() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
   };

});
