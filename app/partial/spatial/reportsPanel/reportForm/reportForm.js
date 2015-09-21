angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, reportMsgService, locale, Report, reportRestService){
    //Report form mode
    $scope.formMode = 'CREATE';
    
    $scope.getFormMode = function(mode){
        return mode === $scope.formMode;
    };
    
    //Set positions selector dropdown options
    $scope.positionItems = [];
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_all'), "code": "all"});
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_last'), "code": "last"});
    
    //Set positions selector dropdown options
    $scope.positionTypeItems = [];
    $scope.positionTypeItems.push({"text": locale.getString('spatial.reports_form_positions_selector_type_option_positions'), "code": "positions"});
    $scope.positionTypeItems.push({"text": locale.getString('spatial.reports_form_positions_selector_type_option_hours'), "code": "hours"});
    
    //Set vessel search type dropdown options
    $scope.vesselSearchItems = [];
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "vessel"});
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"});
    
    
    $scope.submitingReport = false;
    $scope.vesselSearchBy = 'vessel';
    
    $scope.init = function(){
        $scope.report = new Report();
        $scope.formAlert = {
            visible: false,
            msg: ''
        };
        $scope.submitingReport = false;
        $scope.vesselsSelectionIsValid = true;
        $scope.report.vesselsSelection = [];
        
        $scope.shared = {
            searchVesselString: '',
            vessels: []
        };
        
        angular.element('#reportEndDate').find('input').datetimepicker({
            minDate: '1950-01-01', 
            formatDate: 'Y-m-d', 
            format: 'Y-m-d G:i'
        });
    };
    
    $scope.resetForm = function(){
        $scope.init();
        //$scope.vmsFilters = [];
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
            //console.log($scope.report.toJson());
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
    
    $scope.validateDates = function(sDate, eDate){
        var sMomDate = moment(sDate, 'YYYY-MM-DD');
        var eMomDate = moment(eDate, 'YYYY-MM-DD');
        
        if (sMomDate.isAfter(eMomDate)){
            return false;
        } else {
            return true;
        }
    };
    
    $scope.$on('openReportForm', function(e, args){
        $scope.init();
        $scope.formMode = 'CREATE';
        $scope.reportForm.$setPristine();
        if (args){
            $scope.formMode = 'EDIT';
            $scope.report = $scope.report.fromJson(args.report);
        }
    });
    
    $scope.$watch('report.positionSelector', function(newVal, oldVal){
        if ($scope.report && newVal === 'all'){
            //Reset X Value field
            $scope.report.xValue = undefined;
        }
    });
    
    $scope.$watch('report.positionTypeSelector', function(newVal, oldVal){
        if ($scope.report && newVal === 'hours'){
            $scope.report.startDateTime = undefined;
            $scope.report.endDateTime = undefined;
        }
    });
    
    $scope.$watch('report.startDateTime', function(newVal, oldVal){
        if (angular.isDefined(newVal)){
            var dateWidget = angular.element('#reportEndDate').find('input');
            var startCmp = newVal.split(' ');
              
            dateWidget.datetimepicker({
                minDate: startCmp[0],
                formatDate: 'Y-m-d',
                format: 'Y-m-d G:i'
            });
            
            if (angular.isDefined($scope.report.endDateTime)){
                var validDates = $scope.validateDates(startCmp[0], $scope.report.endDateTime.split(' ')[0]);
                if (!validDates){
                    dateWidget.val(null);
                }
            }
        }
    });
    
    var createReportSuccess = function(response){
        $scope.toggleReportForm();
        reportMsgService.show(locale.getString('spatial.success_create_report'), 'success');
        $scope.$emit('reloadReportsList');
    };
    
    var createReportError = function(error){
        $scope.formAlert.visible = true;
        $scope.formAlert.msg = locale.getString('spatial.error_create_report');
    };
    
    var updateReportSuccess = function(response){
        $scope.toggleReportForm();
        reportMsgService.show(locale.getString('spatial.success_update_report'), 'success');
    };
    
    var updateReportError = function(error){
        $scope.formAlert.visible = true;
        $scope.formAlert.msg = locale.getString('spatial.error_update_report');
    };
});