angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, $timeout, locale, Report, reportRestService){
    //Report form mode
    $scope.formMode = 'CREATE';
    
    $scope.getFormMode = function(mode){
        return mode === $scope.formMode;
    };
    
    $scope.formAlert = {
        visible: false,
        startFade: false,
        type: 'error',
        msg: ''
    };
    $scope.bottomAlert = false;
    
    //Show info section to inform the user about successes and errors
    $scope.showAlert = function(msg, type){
        $scope.formAlert.msg = msg;
        $scope.formAlert.type = type;
        $scope.formAlert.visible = true;
        $timeout(function(){
            $scope.hideAlert();
        }, 3000);
    };
    
    //Hide info section
    $scope.hideAlert = function(){
        $scope.formAlert.startFade = true;
        $timeout(function(){
            $scope.formAlert.visible = false;
            $scope.formAlert.startFade = false;
        }, 1000);
    };
      
    
    //Set positions selector dropdown options
    $scope.positionItems = [];
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_all'), "code": "all"});
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_last_positions'), "code": "x_positions"});
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_last_hours'), "code": "x_hours"});
    
    //Set vessel search type dropdown options
    $scope.vesselSearchItems = [];
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "vessel"});
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"});
    
    //Vessel criteria|selection
    $scope.vesselsSelectionIsValid = true;
    //$scope.vesselsSelection = [];
    
    //Data containers for report filtering criteria|selection
    
    //$scope.vmsFilters = [];
    
    $scope.submitingReport = false;
    $scope.vesselSearchBy = 'vessel';
    
    $scope.init = function(){
        $scope.bottomAlert = true;
        $scope.report = new Report();
    };
    
    $scope.resetForm = function(){
        $scope.init();
        $scope.report.vesselsSelection = [];
        //$scope.vmsFilters = [];
        $scope.submitingReport = false;
        $scope.vesselsSelectionIsValid = true;
        $scope.reportForm.$setPristine();
    };
    
    $scope.validateVesselsSelection = function(){
        if ($scope.report.vesselsSelection.length === 0){
            $scope.vesselsSelectionIsValid = false;
        } else {
            $scope.vesselsSelectionIsValid = true;
        }
    };
    
    $scope.saveReport = function(){
        $scope.submitingReport = true;
        $scope.validateVesselsSelection();
        if ($scope.reportForm.$valid && $scope.vesselsSelectionIsValid){
            //TODO we need to check the date interval manually
            console.log($scope.report.toJson());
            if ($scope.formMode === 'CREATE'){
                reportRestService.createReport($scope.report).then(createReportSuccess, createReportError);
            } else if ($scope.formMode === 'EDIT'){
                reportRestService.updateReport($scope.report).then(updateReportSuccess, updateReportError);
            }
        } else {
            //TODO error logic if needed
            console.log('there are errors in the form');
        }
    };
    
    $scope.$on('openReportForm', function(e, args){
        $scope.init();
        $scope.formMode = 'CREATE';
        $scope.bottomAlert = false;
        $scope.submitingReport = false;
        $scope.vesselsSelectionIsValid = true;
        $scope.reportForm.$setPristine();
        if (args){
            $scope.formMode = 'EDIT';
            reportRestService.getReport(args.id).then(getReportSuccess, getReportError);
        }
    });
    
    var getReportSuccess = function(response){
        $scope.report = $scope.report.fromJson(response);
    };
    
    var getReportError = function(error){
        $scope.formAlert.type = 'error';
        $scope.formAlert.msg = locale.getString('spatial.error_entry_not_found');
        $scope.bottomAlert = true;
    };
    
    var createReportSuccess = function(response){
        $scope.showAlert(locale.getString('spatial.success_create_report'), 'success');
        $scope.bottomAlert = true;
        $scope.$emit('reloadReportsList');
    };
    
    var createReportError = function(error){
        $scope.showAlert(locale.getString('spatial.error_create_report'), 'error');
    };
    
    var updateReportSuccess = function(response){
        $scope.showAlert(locale.getString('spatial.success_update_report'), 'success');
        $scope.bottomAlert = true;
    };
    
    var updateReportError = function(error){
        $scope.showAlert(locale.getString('spatial.error_update_report'), 'error');
    };
    
    $scope.$watch('report.positionSelector', function(newVal, oldVal){
        if ($scope.report && $scope.report.positionSelector === 'all'){
            //Reset X Value field
            $scope.report.xValue = undefined;
        }
    });
    
    $scope.$watch('bottomAlert', function(newVal, oldVal){
        if (newVal){
            $timeout(function(){
                if (!$scope.isVisible.reportsList){
                    $scope.bottomAlert = false;
                    $scope.toggleReportForm();
                }
            }, 3000);
        }
    });
});