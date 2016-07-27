angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, $modal, $anchorScroll, reportMsgService, locale, Report, reportRestService, spatialRestService, configurationService, movementRestService, reportService, SpatialConfig, spatialConfigRestService, userService, loadingStatus, reportFormService){
    //Report form mode
    $scope.showVesselFilter = false;

    //set visibility types in dropdown option
    $scope.visibilities = [
                           {"text": locale.getString('spatial.reports_table_share_label_private'), "code": "private"},
                           {"text": locale.getString('spatial.reports_table_share_label_scope'), "code": "scope"},
                           {"text": locale.getString('spatial.reports_table_share_label_public'), "code": "public"}
                           ];
    
    //Set positions selector dropdown options
    $scope.positionItems = [
        {"text": locale.getString('spatial.reports_form_positions_selector_option_all'), "code": "all"},
        {"text": locale.getString('spatial.reports_form_positions_selector_option_last'), "code": "last"}
    ];

    //Set positions selector dropdown options
    $scope.positionTypeItems = [
        {"text": locale.getString('spatial.reports_form_positions_selector_type_option_positions'), "code": "positions"},
        {"text": locale.getString('spatial.reports_form_positions_selector_type_option_hours'), "code": "hours"}
    ];

    //Set vessel search type dropdown options
    $scope.vesselSearchItems = [
        {"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "asset"},
        {"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"}
    ];

    //Set movement type dropdown options
    $scope.movementTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');

    //Set movemment activity type dropdown options
    $scope.activityTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT');

    //Set category types dropdown options
    $scope.categoryTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'CATEGORY_TYPE'), 'CATEGORY_TYPE', 'MOVEMENT');

    //Set movement source types dropdown options
    $scope.movementSourceTypes = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('MOVEMENT_SOURCE_TYPES'),'MOVEMENT_SOURCE_TYPES','MOVEMENT');

    $scope.submitingReport = false;

    $scope.showSaveBtn = function(){
        var result = false;
        if ($scope.formMode === 'CREATE'){
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
        $scope.showVesselFilter = false;

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
            $scope.report.areas = $scope.exportSelectedAreas();
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
            templateUrl: 'partial/spatial/reportsPanel/reportForm/areasSelectionFieldset/areasSelectionFieldset.html',
            controller: 'AreasselectionfieldsetCtrl',
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
                    if(!angular.isDefined($scope.report.currentConfig) || !angular.isDefined($scope.report.currentConfig.mapConfiguration)){
                        $scope.report.currentConfig = {'mapConfiguration': {}};
                    }else{
                        angular.forEach(_.keys($scope.report.currentConfig.mapConfiguration),function(value,key){
                            if(!angular.isDefined(value)){
                                delete $scope.report.currentConfig.mapConfiguration[key];
                            }
                        });
                    }
                    return $scope.report.currentConfig;
                },
                hasMap: function(){
                    if(!angular.isDefined($scope.report.currentConfig)){
                        $scope.report.currentConfig = {'mapConfiguration': {}};
                    }
                    return $scope.report.withMap;
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
            $scope.report.areas = $scope.exportSelectedAreas();
            $scope.reportTemp = new SpatialConfig();
            angular.copy($scope.report,$scope.reportTemp);
    		reportService.runReportWithoutSaving($scope.report);
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
                data.areas = $scope.exportSelectedAreas();
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
        $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList);
        reportMsgService.show(locale.getString('spatial.success_create_report'), 'success');
        loadingStatus.isLoading('SaveReport',false);
    };

    var createReportError = function(error){
        reportError(error,'spatial.error_create_report');
        loadingStatus.isLoading('SaveReport',false);
    };

    var updateReportSuccess = function(response){
        if($scope.repNav.hasPreviousState()){
            $scope.repNav.goToPreviousView();
        }else{
            $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList);
        }
        reportMsgService.show(locale.getString('spatial.success_update_report'), 'success');
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
            if(!angular.equals(report.mapConfiguration.referenceDataSettings, report.currentConfig.mapConfiguration.referenceDataSettings)){
				report.mapConfiguration.referenceDataSettings = report.currentConfig.mapConfiguration.referenceDataSettings;
	    	}
    	}
		return report;
    };
    
    $scope.resetReport = function(){
    	if($scope.reportForm.$dirty){
            loadingStatus.isLoading('ResetReport',true);
	    	$scope.reportForm.$setPristine();
	    	reportRestService.getReport($scope.report.id).then(function(response){
	    		$scope.init();
	    	    $scope.report = $scope.report.fromJson(response);
	    	    $scope.report.currentConfig = {mapConfiguration: {}};
                if (angular.isDefined($scope.report.areas) && $scope.report.areas.length > 0){
                    getAreaProperties(buildAreaPropArray());
                }else{
                    $scope.selectedAreas = [];
                }
	    	    angular.copy($scope.report.mapConfiguration,$scope.report.currentConfig.mapConfiguration);
	    	    $scope.reportOwner = response.createdBy;
                loadingStatus.isLoading('ResetReport',false);
	    	}, function(error){
	    		$anchorScroll();
	    		$scope.formAlert.msg = locale.getString('spatial.error_entry_not_found');
	    		$scope.formAlert.visible = true;
                loadingStatus.isLoading('ResetReport',false);
	    	});
    	}
    };
    
    var loadReportForm = function(){
        switch($scope.formMode){
            case 'CREATE':
            case 'EDIT':
                if(reportService.outOfDate && !$scope.reportTemp){
                    $scope.reportTemp = {};
                    angular.copy($scope.report,$scope.reportTemp);
                }

                if(!reportService.outOfDate && $scope.reportTemp){
                    delete $scope.reportTemp;
                }

                $scope.init();
                
                if (angular.isDefined($scope.reportToLoad)){
                    $scope.reportOwner = $scope.reportToLoad.createdBy;
                }

                if($scope.formMode === 'EDIT'){
                    angular.copy($scope.report.fromJson($scope.reportToLoad),$scope.report);
                    delete $scope.reportToLoad;
                }
            break;
            case 'EDIT-FROM-LIVEVIEW':
                if(reportService.outOfDate && $scope.reportTemp){
                    $scope.report = new Report();
                    angular.copy($scope.reportTemp,$scope.report);
                    delete $scope.reportTemp;
                }else{
                    $scope.init();
                
                    if (angular.isDefined($scope.reportToLoad)){
                        $scope.reportOwner = $scope.reportToLoad.createdBy;
                    }
                    angular.copy($scope.report.fromJson($scope.reportToLoad),$scope.report);
                    delete $scope.reportToLoad;
                }
        }

        $scope.selectedAreas = [];
        if (angular.isDefined($scope.report.areas) && $scope.report.areas.length > 0){
            getAreaProperties(buildAreaPropArray());
        }else{
            $scope.selectedAreas = [];
        }

        $scope.report.currentConfig = {mapConfiguration: {}};
        angular.copy($scope.report.mapConfiguration,$scope.report.currentConfig.mapConfiguration);
        setTimeout(function() {
        	$scope.reportForm.$setPristine();
        }, 100);
    };

    /**
     * Export all selected areas when modal is closed while saving
     * 
     * @memberof ReportformCtrl
     * @public
     * @alias exportSelectedAreas
     * @returns {Array} An array containing all selected areas properly formatted to submit to server side
     */
    $scope.exportSelectedAreas = function(){
        var exported = [];
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            var area = {
                gid: parseInt($scope.selectedAreas[i].gid),
                areaType: $scope.selectedAreas[i].areaType    
            };
            exported.push(area);
        }
        
        return exported;
    };

    /**
     * Build proper array from the modal resolved selected areas. This is to be used to request area properties to server
     * 
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var buildAreaPropArray = function(){
        var areas = [];
        for (var i = 0; i < $scope.report.areas.length; i++){
            areas.push({
                gid : $scope.report.areas[i].gid,
                areaType: $scope.report.areas[i].areaType
            });
        }
        return areas;
    };

    /**
     * Get area properties from the Spatial REST API
     * 
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var getAreaProperties = function(data){
        spatialRestService.getAreaProperties(data).then(function(response){
            $scope.selectedAreas = buildSelectedAreasArray(response.data);
        }, function(error){
            $anchorScroll();
            $scope.formAlert.msg = locale.getString('spatial.area_selection_modal_get_selected_sys_area_details_error');
            $scope.formAlert.visible = true;
        });
    };

    /**
     * Build properly formated array out of the area properties server response data and merge it with the existent modal resolved selected areas.
     * 
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var buildSelectedAreasArray = function(data){
        var finalAreas = [];
        for (var i = 0; i < data.length; i++){
            var area = data[i];
            area.gid = parseInt(area.gid);
            for (var j = 0; j < $scope.report.areas.length; j++){
                if (parseInt($scope.report.areas[j].gid) === parseInt(data[i].gid) && $scope.report.areas[j].areaType === data[i].areaType){
                    area.id = parseInt($scope.report.areas[j].id);
                }
            }
            finalAreas.push(area);
        }
        
        return finalAreas;
    };
    
    $scope.$watch(function(){return $scope.repNav.isViewVisible('reportForm');}, function(newVal,oldVal){
        if(newVal===true){
            loadReportForm();
        }
    });
    
});
