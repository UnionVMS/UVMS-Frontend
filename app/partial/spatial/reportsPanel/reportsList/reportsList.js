/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').factory('reportMsgService', function($timeout){
    var alert = {
        visible: false,
        type: '',
        msg: ''
    };
    
    alert.show = function(msg, type, useTimeout, time){
        if (!angular.isDefined(useTimeout)){
            useTimeout = false;
        }
        var obj = this;
        this.msg = msg;
        this.visible = true;
        this.type = type;
        if (useTimeout){
            var timeout = 3000;
            if (angular.isDefined(time)){
                timeout = time;
            }
            $timeout(function(){
                obj.hide();
            }, timeout, true, obj);
        }
    };
    
    alert.hide = function(){
        this.visible = false;
        this.type = '';
        this.msg = '';
    };
    
    return alert;
});

angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, $filter, globalSettingsService, reportMsgService, $anchorScroll, locale, reportRestService, confirmationModal, reportService, spatialHelperService, $state, $window, userService, reportingNavigatorService){
    //config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: globalSettingsService.getDateFormat()
    };
    
    $scope.isLoadingReportsList = true;
    $scope.tableAlert = reportMsgService;
    
    $scope.reportsList = [];
    $scope.reportTableInstance = {};
    $scope.searchString = '';
    
    $scope.removeDefaultTooltip = locale.getString('spatial.reports_table_remove_default_label');
    $scope.makeDefaultTooltip = locale.getString('spatial.reports_table_make_default_label');
    
    //General table configuration
    
    $scope.itemsByPage = 13;
    
    $scope.displayedRecords = [].concat($scope.reportsList);
    
    //Run the report
    $scope.runReport = function(index){
        var record = $scope.displayedRecords[index];
        $scope.repServ.id = $scope.displayedRecords[index].id;
        $scope.repServ.runReport(record);

        var keepState = record.reportType === 'summary' ? true : undefined;
        $scope.close(keepState);
    };
    
    //Report filter definitions
    $scope.showFilters = function(index){
        $scope.isLoadingReportsList = true;
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
    
    //checks and returns all visibility levels that should be shown in the share dropdown menu
    $scope.getVisibilityLevels = function(report){
        var visibility = [];
        if (userService.isAllowed('MANAGE_ALL_REPORTS', 'Reporting', true)){
            visibility = ['PRIVATE', 'SCOPE', 'PUBLIC'];
        } else {
            angular.forEach(report.shareable, function(item){
                if (userService.isAllowed('SHARE_REPORT_' + item, 'Reporting', true)){
                    visibility.push(item);
                }
            });
            
            if (visibility.indexOf('PRIVATE') === -1){
                visibility.push('PRIVATE');
            }
        }
        
        return visibility;
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
                $scope.isLoadingReportsList = true;
                reportRestService.setDefaultReport(finalRepId, true).then(setDefaultSuccess, setDefaultError);
            }, options);
        } else {
            $scope.isLoadingReportsList = true;
            reportRestService.setDefaultReport(repId, true).then(setDefaultSuccess, setDefaultError);
        }
    };
    
    $scope.setDefaultRepLocally = function(id, status){
        var rec = $filter('filter')($scope.reportsList, {id: id})[0];
        if (angular.isDefined(rec)){
            rec.isDefault = status;
        }
    };
    
    var setDefaultSuccess = function(response){
        $scope.isLoadingReportsList = false;
        
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
        $scope.tableAlert.show(infoText, 'success', true);
    }; 
    
    var setDefaultError = function(error){
        $scope.isLoadingReportsList = false;
        $scope.tableAlert.show('spatial.reports_set_default_report_error', 'error', true);
    };

    //Share report
    $scope.shareReport = function(index, visibility){
        if ($scope.displayedRecords[index].visibility.toUpperCase() !== visibility){
            var options = {
                textLabel : locale.getString("spatial.reports_share_report_confirmation_text") + $scope.displayedRecords[index].name.toUpperCase()  + '?'
            };
            confirmationModal.open(function(){
                reportRestService.shareReport($scope.displayedRecords[index].id, visibility, index).then(refreshSharedReport, $scope.getReportsListError);
            }, options);
        }
    };

    var refreshSharedReport = function(response){
        var index = $scope.reportsList.indexOf($scope.displayedRecords[response.reportIdx]);
       
        if (index !== -1) {
            $scope.reportsList[index].shareable = response.data;
            $scope.reportsList[index].visibility = response.visibility;      
        }

        $scope.isLoadingReportsList = false;
        $anchorScroll();
    };

    //Delete report
    $scope.deleteReport = function(index){
        var options = {
            textLabel : locale.getString("spatial.reports_delete_report_confirmation_text") + $scope.displayedRecords[index].name.toUpperCase() + '?'
        };
        confirmationModal.open(function(){
            $scope.isLoadingReportsList = true;
            reportRestService.deleteReport($scope.displayedRecords[index].id, index).then(deleteReportSuccess, deleteReportError);
        }, options);
    };
    
    $scope.$watch(function(){return $scope.repServ.errorLoadingDefault;}, function(newVal, oldVal){
        if (newVal){
            $scope.tableAlert.show('spatial.map_error_loading_default_report', 'error', true);
            $scope.repServ.errorLoadingDefault = false;
        }
    });
    
   //Get Report Configs Success callback
    var getReportSuccess = function(response){
        $scope.isLoadingReportsList = false;
        $scope.openReportForm('EDIT',response);
    };
    
    //Get Report Configs Failure callback
    var getReportError = function(error){
        $scope.isLoadingReportsList = false;
        $anchorScroll();
        $scope.tableAlert.show('spatial.error_entry_not_found', 'error', true);
    };
    
    //Delete report Success callback
    var deleteReportSuccess = function(resp){
        $scope.repServ.loadReportHistory();
    	var index = $scope.reportsList.indexOf($scope.displayedRecords[resp.index]);
    	
    	//Check if report is the current liveview report and if so remova data
    	var rep = $scope.displayedRecords[resp.index];
    	if ($scope.repServ.id === rep.id){
    	    if (rep.withMap === false){
    	        reportingNavigatorService.goToView('liveViewPanel','mapPanel');
    	    }
    	    $scope.repServ.resetReport();
    	}
    	
        if (index !== -1) {
            $scope.reportsList.splice(index, 1);
        }
        $scope.isLoadingReportsList = false;
        $anchorScroll();
        
        if ($scope.reportsList.length === 0){
            $scope.tableAlert.show('spatial.table_no_data', 'info');
        } else {
            $scope.tableAlert.show('spatial.success_delete_report', 'success', true);
        }
    };
    
    //Delete report Failure callback
    var deleteReportError = function(error){
        $scope.isLoadingReportsList = false;
        $anchorScroll();
        $scope.tableAlert.show('spatial.error_delete_failed', 'error', true, 8000);
    };
    
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

   //load reports on reportsList
    $scope.loadReportList = function(){
        $scope.isLoadingReportsList = true;
        reportRestService.getReportsList().then(getReportsListSuccess, getReportsListError);
    };
    
    //SUCESS AND FAILURES CALLBACKS
    
    //Get Report List Success callback
    var getReportsListSuccess = function(reports){
        $scope.reportsList = reports;
        $scope.isLoadingReportsList = false;
        if(angular.isDefined($scope.reportsList) && $scope.reportsList.length === 0){
            $scope.tableAlert.show('spatial.table_no_data', 'info');
        }
    };
    
    //Get Report List Failure callback
    var getReportsListError = function(error){
        $scope.isLoadingReportsList = false;
        $scope.tableAlert.show('spatial.error_get_reports_list', 'error', true);
        $scope.reportsList = [];
    };

    var init = function() {
        $scope.loadReportList();
    };
    
    init();
});

