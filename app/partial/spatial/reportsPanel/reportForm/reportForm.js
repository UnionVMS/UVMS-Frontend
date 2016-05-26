angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, $modal, $anchorScroll, reportMsgService, locale, Report, reportRestService, spatialRestService, configurationService, movementRestService, reportService, SpatialConfig, spatialConfigRestService, userService, loadingStatus, reportFormService){
    //Report form mode
    $scope.formMode = 'CREATE';

    $scope.getFormMode = function(mode){
        return mode === $scope.formMode;
    };

    //set visibility types in dropdown option
    $scope.visibilities = [
                           {"text": locale.getString('spatial.reports_table_share_label_private'), "code": "private"},
                           {"text": locale.getString('spatial.reports_table_share_label_scope'), "code": "scope"},
                           {"text": locale.getString('spatial.reports_table_share_label_public'), "code": "public"}
                           ];
    
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

    $scope.showSaveBtn = function(){
        var result = false;
        if ($scope.getFormMode('CREATE')){
            result = true;
        } else {
            if ((angular.isDefined($scope.reportOwner) && $scope.reportOwner === userService.getUserName()) || $scope.isAllowed('Reporting', 'MANAGE_ALL_REPORTS')){
                result = true;
            }
        }
        return result;
    };
    
    $scope.init = function(){
    	reportFormService.report = new Report();
        $scope.report = reportFormService.report;
        $scope.formAlert = {
            visible: false,
            msg: ''
        };
        $scope.reportOwner = undefined;
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
            
            validateRangeFieldGroup(min,max,'movMinSpeed','movMaxSpeed','positionSecForm');
        }

        //Validate segments speed and duration ranges
        if ($scope.report.hasVmsFilter === true && $scope.report.hasSegmentsFilter === true && angular.isDefined($scope.report.vmsFilters.segments)){
            min = $scope.report.vmsFilters.segments.segMinSpeed;
            max = $scope.report.vmsFilters.segments.segMaxSpeed;
            
            validateRangeFieldGroup(min,max,'segMinSpeed','segMaxSpeed','segmentSecForm');

            minD = $scope.report.vmsFilters.segments.segMinDuration;
            maxD = $scope.report.vmsFilters.segments.segMaxDuration;

            validateRangeFieldGroup(minD,maxD,'segMinDuration','segMaxDuration','segmentSecForm');
        }

        //Validate tracks time at sea and duration ranges
        if ($scope.report.hasVmsFilter === true && $scope.report.hasTracksFilter === true && angular.isDefined($scope.report.vmsFilters.tracks)){
            min = $scope.report.vmsFilters.tracks.trkMinTime;
            max = $scope.report.vmsFilters.tracks.trkMaxTime;
            
            validateRangeFieldGroup(min,max,'trkMinTime','trkMaxTime','trackSecForm');

            minD = $scope.report.vmsFilters.tracks.trkMinDuration;
            maxD = $scope.report.vmsFilters.tracks.trkMaxDuration;
            
            validateRangeFieldGroup(minD,maxD,'trkMinDuration','trkMaxDuration','trackSecForm');
        }
    };
    
    var validateRangeFieldGroup = function(min,max,fieldMin,fieldMax,subForm){
    	if(angular.isDefined(min) && min<0){
    		$scope.reportForm.reportBodyForm[subForm][fieldMin].$setValidity('minError', false);
        }else{
            $scope.reportForm.reportBodyForm[subForm][fieldMin].$setValidity('minError', true);
    	}
    	if(angular.isDefined(max) && max<0){
    		$scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('minError', false);
        }else{
            $scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('minError', true);
    	}
        if(angular.isDefined(min) && angular.isDefined(max) && min !== null && max != null && min > max){
            $scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('maxError', false);
        }else{
            $scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('maxError', true);
        }
    };

    $scope.saveReport = function(){
    	loadingStatus.isLoading('SaveReport',true);
        $scope.submitingReport = true;
        $scope.validateRanges();
        if ($scope.reportForm.$valid && $scope.vesselsSelectionIsValid){
        	$scope.configModel = new SpatialConfig();
            if ($scope.formMode === 'CREATE'){
            	$scope.report.currentConfig.mapConfiguration.layerSettings = reportService.checkLayerSettings($scope.report.currentConfig.mapConfiguration.layerSettings);
            	$scope.report = checkMapConfigDifferences($scope.report);
                reportRestService.createReport($scope.report).then(createReportSuccess, createReportError);
            } else if ($scope.formMode === 'EDIT' || $scope.formMode === 'EDIT-FROM-LIVEVIEW'){
        		$scope.report.currentConfig.mapConfiguration.layerSettings = reportService.checkLayerSettings($scope.report.currentConfig.mapConfiguration.layerSettings);
            	$scope.report = checkMapConfigDifferences($scope.report);
                reportRestService.updateReport($scope.report).then(updateReportSuccess, updateReportError);
            }
        } else {
        	loadingStatus.isLoading('SaveReport',false);
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
        	if(!angular.equals($scope.report.areas,data)){
        		$scope.reportForm.$setDirty();
            	$scope.report.areas = data;
        	}
        });
    };
    
    $scope.openMapConfigurationModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/mapConfigurationModal/mapConfigurationModal.html',
            controller: 'MapconfigurationmodalCtrl',
            size: 'lg',
            resolve: {
                reportConfigs: function(){
                    if(!angular.isDefined($scope.report.currentConfig)){
                        $scope.report.currentConfig = {'mapConfiguration': {}};
                    }
                    return $scope.report.currentConfig;
                }
            }
        });

        modalInstance.result.then(function(data){
        	if(!angular.equals($scope.report.currentConfig.mapConfiguration,data.mapSettings)){
        		$scope.reportForm.$setDirty();
        		$scope.report.currentConfig.mapConfiguration = data.mapSettings;
        	}
        });
    };
    
    $scope.runReport = function() {
    	$scope.submitingReport = true;
    	$scope.mergedReport = undefined;
    	$scope.validateRanges();
    	if($scope.reportForm.reportBodyForm.$valid && $scope.vesselsSelectionIsValid){
    		reportService.runReportWithoutSaving($scope.report);
    		$scope.$emit('goToLiveView');
        	$scope.toggleReportForm();
    	}else{
    		var invalidElm = angular.element('#reportForm')[0].querySelector('.ng-invalid');
            var errorElm = angular.element('#reportForm')[0].querySelector('.has-error');
            if (invalidElm){
                invalidElm.scrollIntoView();
            } else if (invalidElm === null && errorElm){
                errorElm.scrollIntoView();
            }
    	}
    };
    
    $scope.saveAsReport = function() {
    	$scope.submitingReport = true;
        $scope.validateRanges();
        if ($scope.reportForm.reportBodyForm.$valid && $scope.vesselsSelectionIsValid){
        	var modalInstance = $modal.open({
                templateUrl: 'partial/spatial/reportsPanel/reportForm/saveAsModal/saveAsModal.html',
                controller: 'SaveasmodalCtrl',
                size: 'md',
                resolve: {
                    reportData: function(){
                        return $scope.report;
                    }
                }
            });

            modalInstance.result.then(function(data){
            	data.currentConfig.mapConfiguration.layerSettings = reportService.checkLayerSettings(data.currentConfig.mapConfiguration.layerSettings);
            	data = checkMapConfigDifferences(data);
            	reportRestService.createReport(data).then(createReportSuccess, createReportError);
            });
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
    
    $scope.$on('openReportForm', function(e, args){
        $scope.init();
        
        if (angular.isDefined(args)){
            $scope.reportOwner = args.report.createdBy;
        }
        
        $scope.formMode = 'CREATE';
        if (args){
        	if(args.report.isFromLiveView){
        		$scope.formMode = 'EDIT-FROM-LIVEVIEW';
        	}else{
        		$scope.formMode = 'EDIT';
        	}
            angular.copy($scope.report.fromJson(args.report),$scope.report);
        }
        $scope.report.currentConfig = {mapConfiguration: {}};
        angular.copy($scope.report.mapConfiguration,$scope.report.currentConfig.mapConfiguration);
        setTimeout(function() {
        	$scope.reportForm.$setPristine();
        }, 100);
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
        loadingStatus.isLoading('SaveReport',false);
    };

    var createReportError = function(error){
        reportError(error,'spatial.error_create_report');
        loadingStatus.isLoading('SaveReport',false);
    };

    var updateReportSuccess = function(response){
        $scope.toggleReportForm();
        reportMsgService.show(locale.getString('spatial.success_update_report'), 'success');
        $scope.$emit('reloadReportsList');
        loadingStatus.isLoading('SaveReport',false);
    };

    var updateReportError = function(error){
        reportError(error,'spatial.error_update_report');
        loadingStatus.isLoading('SaveReport',false);
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
    
    var checkMapConfigDifferences = function(report){
		if(!angular.equals(report.mapConfiguration, report.currentConfig.mapConfiguration)){
			
        	if(!angular.equals(report.mapConfiguration.coordinatesFormat, report.currentConfig.mapConfiguration.coordinatesFormat)){
        		report.mapConfiguration.coordinatesFormat = report.currentConfig.mapConfiguration.coordinatesFormat;
        	}
			if(!angular.equals(report.mapConfiguration.displayProjectionId, report.currentConfig.mapConfiguration.displayProjectionId)){
	    		report.mapConfiguration.displayProjectionId = report.currentConfig.mapConfiguration.displayProjectionId;
	    	}
			if(!angular.equals(report.mapConfiguration.mapProjectionId, report.currentConfig.mapConfiguration.mapProjectionId)){
	    		report.mapConfiguration.mapProjectionId = report.currentConfig.mapConfiguration.mapProjectionId;
	    	}
			if(!angular.equals(report.mapConfiguration.scaleBarUnits, report.currentConfig.mapConfiguration.scaleBarUnits)){
	    		report.mapConfiguration.scaleBarUnits = report.currentConfig.mapConfiguration.scaleBarUnits;
	    	}
			
			if(!angular.equals(report.mapConfiguration.stylesSettings, report.currentConfig.mapConfiguration.stylesSettings)){
				report.mapConfiguration.stylesSettings = report.currentConfig.mapConfiguration.stylesSettings;
	    	}
			if(!angular.equals(report.mapConfiguration.visibilitySettings, report.currentConfig.mapConfiguration.visibilitySettings)){
				report.mapConfiguration.visibilitySettings = report.currentConfig.mapConfiguration.visibilitySettings;
	    	}
			if(!angular.equals(report.mapConfiguration.layerSettings, report.currentConfig.mapConfiguration.layerSettings)){
				report.mapConfiguration.layerSettings = report.currentConfig.mapConfiguration.layerSettings;
	    	}
    	}
		return report;
    };
    
    $scope.resetReport = function(){
    	if($scope.reportForm.$dirty){
	    	$scope.reportForm.$setPristine();
	    	reportRestService.getReport($scope.report.id).then(function(response){
	    		$scope.init();
	    	    $scope.report = $scope.report.fromJson(response);
	    	    $scope.report.currentConfig = {mapConfiguration: {}};
	    	    angular.copy($scope.report.mapConfiguration,$scope.report.currentConfig.mapConfiguration);
	    	    $scope.reportOwner = response.createdBy;
	    	}, function(error){
	    		$anchorScroll();
	    		$scope.formAlert.msg = locale.getString('spatial.error_entry_not_found');
	    		$scope.formAlert.visible = true;
	    	});
    	}
    };
    
    $scope.onActivateVmsFilter = function(type,value){
    	if(value === false){
	    	$scope.reportForm.$setDirty();
	    	if(type === 'all' || type === 'positions'){
	    		$scope.report.hasPositionsFilter = false;
	    		$scope.report.vmsFilters.positions = undefined;
	    	}
	    	if(type === 'all' || type === 'segments'){
	    		$scope.report.hasSegmentsFilter = false;
	    		$scope.report.vmsFilters.segments = undefined;
	    	}
	    	if(type === 'all' || type === 'tracks'){
	    		$scope.report.hasTracksFilter = false;
	    		$scope.report.vmsFilters.tracks = undefined;
	    	}
    	}
    };
    
});
