angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, $modal, reportMsgService, locale, Report, reportRestService, spatialRestService, configurationService, movementRestService){
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
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "asset"});
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"});

    //Set movement type dropdown options
    $scope.movementTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');

    //Set movemment activity type dropdown options
    $scope.activityTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT');

    //Set movemment activity type dropdown options
    $scope.categoryTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'CATEGORY_TYPE'), 'CATEGORY_TYPE', 'MOVEMENT');

    $scope.submitingReport = false;

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
            vesselSearchBy: 'asset',
            searchVesselString: '',
            selectAll: false,
            selectedVessels: 0,
            vessels: [],
            areas: []
        };
    };

    $scope.resetForm = function(){
        $scope.init();
        $scope.reportForm.$setPristine();
        $scope.clearVmsErrors();
    };

    $scope.clearVmsErrors = function(){
        for (var attr in $scope.reportForm.$error){
            $scope.reportForm.$setValidity(attr, true);
        }
    };

    $scope.validateRanges = function(){
        var min, max, minD, maxD;
        var status = true;

        //Validate positions speed range
        if ($scope.report.hasVmsFilter === true && $scope.report.hasPositionsFilter === true && angular.isDefined($scope.report.vmsFilters.positions)){
            min = $scope.report.vmsFilters.positions.movMinSpeed;
            max = $scope.report.vmsFilters.positions.movMaxSpeed;
            
            validateRangeFieldGroup(min,max,'movMinSpeed','movMaxSpeed');
        }

        //Validate segments speed and duration ranges
        if ($scope.report.hasVmsFilter === true && $scope.report.hasSegmentsFilter === true && angular.isDefined($scope.report.vmsFilters.segments)){
            min = $scope.report.vmsFilters.segments.segMinSpeed;
            max = $scope.report.vmsFilters.segments.segMaxSpeed;
            
            validateRangeFieldGroup(min,max,'segMinSpeed','segMaxSpeed');

            minD = $scope.report.vmsFilters.segments.segMinDuration;
            maxD = $scope.report.vmsFilters.segments.segMaxDuration;

            validateRangeFieldGroup(minD,maxD,'segMinDuration','segMaxDuration');
        }

        //Validate tracks time at sea and duration ranges
        if ($scope.report.hasVmsFilter === true && $scope.report.hasTracksFilter === true && angular.isDefined($scope.report.vmsFilters.tracks)){
            min = $scope.report.vmsFilters.tracks.trkMinTime;
            max = $scope.report.vmsFilters.tracks.trkMaxTime;
            
            validateRangeFieldGroup(min,max,'trkMinTime','trkMaxTime');

            minD = $scope.report.vmsFilters.tracks.trkMinDuration;
            maxD = $scope.report.vmsFilters.tracks.trkMaxDuration;
            
            validateRangeFieldGroup(minD,maxD,'trkMinDuration','trkMaxDuration');
        }
    };
    
    var validateRangeFieldGroup = function(min,max,fieldMin,fieldMax){
    	if(angular.isDefined(min) && min<0){
    		$scope.reportForm[fieldMin].$setValidity('minError', false);
        }else{
            $scope.reportForm[fieldMin].$setValidity('minError', true);
    	}
    	if(angular.isDefined(max) && max<0){
    		$scope.reportForm[fieldMax].$setValidity('minError', false);
        }else{
            $scope.reportForm[fieldMax].$setValidity('minError', true);
    	}
        if(angular.isDefined(min) && angular.isDefined(max) && min !== null && max != null && min > max){
            $scope.reportForm[fieldMax].$setValidity('maxError', false);
        }else{
            $scope.reportForm[fieldMax].$setValidity('maxError', true);
        }
    };

    $scope.saveReport = function(){
        $scope.submitingReport = true;
        $scope.validateRanges();
        if ($scope.reportForm.$valid && $scope.vesselsSelectionIsValid){
            if ($scope.formMode === 'CREATE'){
                reportRestService.createReport($scope.report).then(createReportSuccess, createReportError);
            } else if ($scope.formMode === 'EDIT'){
                reportRestService.updateReport($scope.report).then(updateReportSuccess, updateReportError);
            }
        } else {
            var invalidElm = angular.element('#reportForm')[0].querySelector('.ng-invalid');
            var errorElm = angular.element('#reportForm')[0].querySelector('.has-error');
            if (invalidElm){
                invalidElm.scrollIntoView();
            } else if (invalidElm === null && errorElm){
                errorElm.scrollIntoView();
            }
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

    $scope.openAreaSelectionModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/areasSelectionModal/areasSelectionModal.html',
            controller: 'AreasselectionmodalCtrl',
            size: 'lg',
            resolve: {
                selectedAreas: function(){
                    return $scope.report.areas;
                }
            }
        });

        modalInstance.result.then(function(data){
            $scope.report.areas = data;
        });
    };
    
    $scope.openMapConfigurationModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/mapConfigurationModal/mapConfigurationModal.html',
            controller: 'MapconfigurationmodalCtrl',
            size: 'lg',
            resolve: {
                mapConfigs: function(){
                    return $scope.report.mapConfiguration;
                }
            }
        });

        modalInstance.result.then(function(data){
            $scope.report.mapConfiguration = data;
        });
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

    var createReportSuccess = function(response){
        $scope.toggleReportForm();
        reportMsgService.show(locale.getString('spatial.success_create_report'), 'success');
        $scope.$emit('reloadReportsList');
    };

    var createReportError = function(error){
        reportError(error,'spatial.error_create_report');
    };

    var updateReportSuccess = function(response){
        $scope.toggleReportForm();
        reportMsgService.show(locale.getString('spatial.success_update_report'), 'success');
        $scope.$emit('reloadReportsList');
    };

    var updateReportError = function(error){
        reportError(error,'spatial.error_update_report');
    };

    var reportError = function(error, defaultMsg) {
        $scope.formAlert.visible = true;
        //var errorMsgCode = error.data.msg?'spatial.' + error.data.msg:'spatial.error_create_report';
        var errorMsg = defaultMsg;

        if (angular.isDefined(error.data.msg)) {
            errorMsg = locale.getString('spatial.'+ error.data.msg);
        } else {
            errorMsg = locale.getString('spatial.'+ defaultMsg);
        }
        
        $scope.formAlert.msg = errorMsg;
    };
});
