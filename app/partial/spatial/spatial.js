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
angular.module('unionvmsWeb').controller('SpatialCtrl',function(/*tripSummaryService, */$scope, $timeout, locale, mapService, spatialHelperService, Report, reportRestService, reportFormService, reportService, $anchorScroll, userService, loadingStatus, $state, $localStorage, comboboxService, reportingNavigatorService, $compile, $modal, confirmationModal){
    $scope.reports = [];
    $scope.executedReport = {};
    $scope.repServ = reportService;
    $scope.loadingStatus = loadingStatus;
    $scope.currentContext = userService.getCurrentContext();
    $scope.comboServ = comboboxService;
    $scope.repNav = reportingNavigatorService;
    $scope.spatialHelper = spatialHelperService;

    $scope.repNav.clearNavigation();
    
    //reset repServ
    $scope.repServ.clearVmsData();
    
   locale.ready('spatial').then(function(){
 /*   reportingNavigatorService.goToView('tripsPanel','tripSummary');
      //tripSummaryService.openNewTrip('FRA-TRP-2016122102030');
      //tripSummaryService.openNewTrip('ESP-TRP-20160630000003');
      tripSummaryService.openNewTrip('MLT-TRP-20160630000001');
      
      return;
*/
       loadingStatus.isLoading('InitialReporting', true);
       
       //reset the map and remove references to it
       if (angular.isDefined(mapService.map)){
           mapService.map.setTarget(null);
           mapService.map = undefined;
       }
       
       //reset report form service
       reportFormService.resetLiveView();
       
       $scope.curState = $state.current.name;
       if($state.current.name === 'app.reporting-id'){
    	   $scope.spatialHelper.tbControl.newTab = false;
           $scope.repServ.isReportExecuting = true;
           
           if(angular.isDefined($localStorage['report'+$state.params.id + '-' + $state.params.guid])){
               angular.copy($localStorage['report' + $state.params.id + '-' + $state.params.guid], reportFormService.liveView);
               var currentReport = new Report();
               angular.copy(reportFormService.liveView.currentReport, currentReport);
               reportFormService.liveView.currentReport = currentReport;
               var originalReport = new Report();
               angular.copy(reportFormService.liveView.originalReport, originalReport);
               reportFormService.liveView.originalReport = originalReport;
        	   reportService.runReportWithoutSaving(reportFormService.liveView.currentReport);
        	   delete $localStorage['report'+$state.params.id + '-' + $state.params.guid];
           }else{
	           reportRestService.getReport($state.params.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               reportFormService.resetLiveView();
                   loadUserReportsList();
	           });
           }
       }else{
	       //let's check for the existence of default reports
	       var defaultRepObj = $scope.spatialHelper.getDefaultReport(true);
	       if (angular.isDefined(defaultRepObj) && !_.isNaN(defaultRepObj.id) && defaultRepObj.id !== 0){
	           $scope.repServ.isReportExecuting = true;
	           reportRestService.getReport(defaultRepObj.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               $scope.repServ.errorLoadingDefault = true;
	               reportFormService.resetLiveView();
	               loadUserReportsList();
	           });
	       }else{
	           loadUserReportsList();
           }
       }
   });
   
   var loadUserReportsList = function(){
       reportRestService.getReportsList().then(function(response){
           if(response.data.length){
               $scope.repServ.loadReportHistory();
               $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList,[undefined,true]);
           }else{
               $scope.openNewReport();
           }
           loadingStatus.isLoading('InitialReporting', false);
       }, function(error){
           $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList,[undefined,true]);
           loadingStatus.isLoading('InitialReporting', false);
       });
   };
   
   $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
   };
   
   //Report filter definitions
   $scope.editReport = function(){
	   $scope.repServ.isReportExecuting = true;
	   loadingStatus.isLoading('LiveviewMap', true, 0);
	   if(!angular.isDefined(reportFormService.liveView.currentReport)){
	       reportRestService.getReport($scope.repServ.id).then(getReportSuccess, getReportError);
	   }else{
	       $scope.loadReportEditing('EDIT-FROM-LIVEVIEW');
	   }
       $scope.spatialHelper.deactivateFullscreen();
   };

   //Create new report from liveview
   $scope.createReportFromLiveview = function(evt){
       $scope.comboServ.closeCurrentCombo(evt);
       $scope.formMode = 'CREATE';
       $scope.spatialHelper.deactivateFullscreen();
       if (reportFormService.liveView.outOfDate){
            var options = {
                textLabel : locale.getString("spatial.reports_discard_changes"),
                yesNo : true
            };
            confirmationModal.open(function(reason){
                if(reason !== 'deny'){
                    $scope.saveReport('form');
                }
            },
            options);
        } else {
            $scope.repNav.goToView('reportsPanel','reportForm');
        }
   };
   
   //Get Report Configs Success callback
   var getReportSuccess = function(response){
       var report = new Report();
       report = report.fromJson(response);
       reportFormService.liveView.originalReport = report;
       
       reportFormService.liveView.currentReport = new Report();
       angular.copy(report, reportFormService.liveView.currentReport);
       $scope.loadReportEditing('EDIT-FROM-LIVEVIEW');
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
        var comboFooter = angular.element('<div class="combo-history-footer col-md-12">' + 
                                            '<div class="row">' +
                                                '<div class="footer-item" ng-click="openReportList($event)"' +
                                                ' ng-class="{\'col-md-5\': isAllowed(\'Reporting\', \'CREATE_REPORT\'), \'col-md-12\': !isAllowed(\'Reporting\', \'CREATE_REPORT\')}">' +
                                                    '<label class="row">{{"spatial.report_history_list_btn" | i18n}}</label>' +
                                                '</div>' +
                                                '<div ng-if="isAllowed(\'Reporting\', \'CREATE_REPORT\')" class="footer-item col-md-7"' +
                                                ' ng-click="createReportFromLiveview($event)">' +
                                                    '<label class="row">{{"spatial.report_history_create_new_btn" | i18n}}</label>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>');

        angular.element('#' + comboId).prepend(comboFooter);
        $compile(comboFooter)($scope);
    };

    $scope.openReportList = function(evt){
        //$scope.spatialHelper.deactivateFullscreen();
        $scope.comboServ.closeCurrentCombo(evt);
        if (evt && reportFormService.liveView.outOfDate){
            var options = {
                textLabel : locale.getString("spatial.reports_discard_changes"),
                yesNo : true
            };
            confirmationModal.open(function(reason){
                if(reason !== 'deny'){
                    $scope.saveReport('list');
                }
            },
            options);
        } else {
            openReportsModal();
        }

        
        
    };

    var openReportsModal = function(){
        if (angular.isDefined($scope.repServ.autoRefreshInterval)){
            $scope.repServ.stopAutoRefreshInterval();
        }
        
        $scope.repNav.addStateCallback($scope.openReportList);
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportsListModal/reportsListModal.html',
            controller: 'ReportslistmodalCtrl',
            size: 'lg'
        });

        if($scope.repNav.isViewVisible('mapPanel')){
            $scope.spatialHelper.configureFullscreenModal(modalInstance);
        }

        modalInstance.result.then(function(data){
            if (!angular.isDefined(data)){
                return;
            }
            if(data.action === 'CREATE'){
                $scope.openNewReport();
            }else if(data.action === 'EDIT'){
                $scope.repServ.isReportExecuting = true;
                var report = new Report();
                reportFormService.report = report.fromJson(data.report);
                $scope.loadReportEditing('EDIT');
            }
        }, function(){
            if ($scope.repServ.refresh.status){
                $scope.repServ.setAutoRefresh();
            }
        });
    };

    $scope.openNewReport = function(){
        $scope.formMode = 'CREATE';
        $scope.repNav.goToView('reportsPanel','reportForm');
    };

    $scope.loadReportEditing = function(mode){
        $scope.formMode = mode;
        $scope.repNav.goToView('reportsPanel','reportForm');
        $scope.repServ.isReportExecuting = false;
        loadingStatus.isLoading('LiveviewMap',false);
    };

    $scope.saveReport = function(action){
        loadingStatus.isLoading('LiveviewMap', true, 4);
        $scope.tempReport = angular.copy(reportFormService.liveView.currentReport);
        reportFormService.liveView.currentReport.currentMapConfig.mapConfiguration.layerSettings = reportFormService.checkLayerSettings(reportFormService.liveView.currentReport.currentMapConfig.mapConfiguration.layerSettings);
        reportFormService.liveView.currentReport = reportFormService.checkMapConfigDifferences(reportFormService.liveView.currentReport);
        reportRestService.updateReport(reportFormService.liveView.currentReport).then(function(response){
            reportFormService.liveView.outOfDate = false;
            angular.copy($scope.tempReport, reportFormService.liveView.currentReport);
            angular.copy(reportFormService.liveView.currentReport, reportFormService.liveView.originalReport);
            delete $scope.tempReport;
            if(action === 'list'){
                openReportsModal();
            }else{
                $scope.repNav.goToView('reportsPanel','reportForm');
            }
            loadingStatus.isLoading('LiveviewMap',false);
        }, function(error){
            $scope.repServ.hasAlert = true;
            $scope.repServ.alertType = 'danger';
            $scope.repServ.message = locale.getString('spatial.error_update_report');
            angular.copy($scope.tempReport, reportFormService.liveView.currentReport);
            delete $scope.tempReport;
            loadingStatus.isLoading('LiveviewMap',false);
        });
    };

    /*$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function() {
        var modals = $('.modal[uib-modal-window="modal-window"]').not($('.alert-modal-content'));

        if (document.fullscreenElement != null) {
            angular.forEach(function(item) {
                item.appendTo('#map');
            });
        } else {
            angular.forEach(function(item) {
                item.appendTo('body');
            });              
        }
	});*/

});
