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
angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, $modal, $anchorScroll, reportMsgService, locale, Report, reportRestService, spatialRestService, configurationService, movementRestService, reportService, SpatialConfig, spatialConfigRestService, userService, loadingStatus, reportFormService){
    //Report form mode
    $scope.showVesselFilter = false;

    //set visibility types in dropdown option
    $scope.visibilities = [];

    //Set the available report types to create
    $scope.reportTypes = [
        {"text": locale.getString('spatial.reports_form_type_standard'), "code": "standard"},
        {"text": locale.getString('spatial.reports_form_type_summary'), "code": "summary"}
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
    
    $scope.repFormServ = reportFormService;


    $scope.aggregationTypes = [
        {
            code: "fs",
            text: locale.getString('spatial.reports_form_aggregation_type_fs')
        },
        {
            code: "vessel",
            text: locale.getString('spatial.reports_form_aggregation_type_vessel')
        },
        {
            code: "period",
            text: locale.getString('spatial.reports_form_aggregation_type_period'),
            items: [
                {
                    code: "day",
                    text: locale.getString('spatial.reports_form_aggregation_type_period_day')
                },
                {
                    code: "month",
                    text: locale.getString('spatial.reports_form_aggregation_type_period_month')
                },
                {
                    code: "year",
                    text: locale.getString('spatial.reports_form_aggregation_type_period_year')
                }

            ]
        },
        {
            code: "area",
            text: locale.getString('spatial.reports_form_aggregation_type_area')
        },
        {
            code: "geartype",
            text: locale.getString('spatial.reports_form_aggregation_type_geartype')
        },
        {
            code: "species",
            text: locale.getString('spatial.reports_form_aggregation_type_species')
        },
        {
            code: "presentation",
            text: locale.getString('spatial.reports_form_aggregation_type_presentation')
        }
    ];

    $scope.showSaveBtn = function(){
        var result = false;
        if ($scope.formMode === 'CREATE'){
            result = true;
        } else {
            if ((angular.isDefined($scope.report) && $scope.report.createdBy === userService.getUserName()) || $scope.isAllowed('Reporting', 'MANAGE_ALL_REPORTS')){
                result = true;
            }
        }
        return result;
    };
    
    $scope.init = function(){
        $scope.formAlert = {
            visible: false,
            msg: ''
        };
        $scope.submitingReport = false;

        if ($scope.formMode === 'CREATE'){
            $scope.report.vesselsSelection = [];
        }
        $scope.showVesselFilter = false;
        $scope.selectedAreas = [];

        $scope.shared = {
            vesselSearchBy: 'asset',
            searchVesselString: '',
            selectAll: false,
            selectedVessels: 0,
            vessels: [],
            areas: []
        };
        
        if ($scope.report.movSources.length === 0){
            $scope.report.movSources = [];
            angular.forEach($scope.movementSourceTypes, function(item){
                $scope.report.movSources.push(item.code);
            });
        }
        
        $scope.checkVisibilities();
    };
    
    $scope.checkVisibilities = function(){
        $scope.visibilities = [{"text": locale.getString('spatial.reports_table_share_label_private'), "code": "private"}];
        var availableVisibilities = ['SCOPE', 'PUBLIC'];
        angular.forEach(availableVisibilities, function(visibility) {
        	if (userService.isAllowed('SHARE_REPORT_' + visibility, 'Reporting', true) || userService.isAllowed('MANAGE_ALL_REPORTS', 'Reporting', true)){
        	    var name = visibility.toLowerCase();
        	    $scope.visibilities.push({"text": locale.getString('spatial.reports_table_share_label_' + name), "code": name});
        	}
        });
    };

    $scope.resetForm = function(){
        reportFormService.report = new Report();
        $scope.report = reportFormService.report;
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
        if (angular.isDefined($scope.report.vmsFilters.positions) && !_.isEmpty($scope.report.vmsFilters.positions)){
            min = $scope.report.vmsFilters.positions.movMinSpeed;
            max = $scope.report.vmsFilters.positions.movMaxSpeed;
            
            validateRangeFieldGroup(min,max,'movMinSpeed','movMaxSpeed','positionSecForm');
        }

        //Validate segments speed and duration ranges
        if (angular.isDefined($scope.report.vmsFilters.segments) && !_.isEmpty($scope.report.vmsFilters.segments)){
            min = $scope.report.vmsFilters.segments.segMinSpeed;
            max = $scope.report.vmsFilters.segments.segMaxSpeed;
            
            validateRangeFieldGroup(min,max,'segMinSpeed','segMaxSpeed','segmentSecForm');

            minD = $scope.report.vmsFilters.segments.segMinDuration;
            maxD = $scope.report.vmsFilters.segments.segMaxDuration;

            validateRangeFieldGroup(minD,maxD,'segMinDuration','segMaxDuration','segmentSecForm');
        }

        //Validate tracks time at sea and duration ranges
        if (angular.isDefined($scope.report.vmsFilters.tracks) && !_.isEmpty($scope.report.vmsFilters.tracks)){
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
        if(angular.isDefined(min) && angular.isDefined(max) && min !== null && max !== null && min > max){
            $scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('maxError', false);
        }else{
            $scope.reportForm.reportBodyForm[subForm][fieldMax].$setValidity('maxError', true);
        }
    };

    $scope.saveReport = function(){
    	loadingStatus.isLoading('SaveReport',true);
        $scope.submitingReport = true;
        $scope.validateRanges();
        if ($scope.reportForm.$valid){
            $scope.report.areas = $scope.exportSelectedAreas();
        	$scope.currentRepCopy = angular.copy($scope.report);
        	$scope.report.currentMapConfig.mapConfiguration.layerSettings = reportFormService.checkLayerSettings($scope.report.currentMapConfig.mapConfiguration.layerSettings);
            $scope.report = reportFormService.checkMapConfigDifferences($scope.report);
            switch ($scope.formMode) {
                case 'CREATE':
                    reportRestService.createReport($scope.report).then(createReportSuccess, createReportError);
                    break;
                case 'EDIT':
                    reportRestService.updateReport($scope.report).then(updateReportSuccess, updateReportError);
                    break;
                case 'EDIT-FROM-LIVEVIEW':
                    if (!angular.equals($scope.currentRepCopy, reportFormService.liveView.originalReport)){
                        reportRestService.updateReport($scope.report).then(updateReportSuccess, updateReportError);
                    } else {
                        loadingStatus.isLoading('SaveReport',false);
                        $scope.repNav.goToPreviousView();
                    }
                    break;
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

    $scope.openMapConfigurationModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/mapConfigurationModal/mapConfigurationModal.html',
            controller: 'MapconfigurationmodalCtrl',
            size: 'lg',
            resolve: {
                reportConfigs: function(){
                    return angular.copy($scope.report.currentMapConfig);
                },
                displayComponents: function(){
                    var components = {
                        visibility: {
                            position: true,
                            segment: true
                        }
                    };
                    
                    if ($scope.report.withMap){
                        components.map = true;
                        components.layers = true;
                        components.referenceData = true;
                        components.styles = {
                            position: true,
                            segment: true,
                            alarm: true
                        };
                    }
                    
                    return components;
                }
            }
        });

        modalInstance.result.then(function(data){
        	if(!angular.equals($scope.report.currentMapConfig.mapConfiguration,data.mapSettings)){
        		$scope.reportForm.$setDirty();
        		$scope.report.currentMapConfig.mapConfiguration = data.mapSettings;
        	}
        });
    };
    
    $scope.runReport = function() {
    	$scope.submitingReport = true;
    	$scope.validateRanges();
    	if($scope.reportForm.reportBodyForm.$valid){
    	    $scope.report.areas = $scope.exportSelectedAreas();
    		reportService.runReportWithoutSaving($scope.report);
    		
    		if (!angular.equals($scope.report, reportFormService.liveView.originalReport)){
                reportFormService.liveView.outOfDate = true;
            } else {
                reportFormService.liveView.outOfDate = false;
            }
    		reportFormService.liveView.currentTempReport = undefined;
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
        if ($scope.reportForm.reportBodyForm.$valid){
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
            	data.currentMapConfig.mapConfiguration.layerSettings = reportFormService.checkLayerSettings(data.currentMapConfig.mapConfiguration.layerSettings);
            	data = reportFormService.checkMapConfigDifferences(data);
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
        reportService.loadReportHistory();
        if($scope.repNav.hasPreviousState()){
            $scope.repNav.goToPreviousView();
        }else{
            $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList);
        }
        reportFormService.report = undefined;
        reportMsgService.show(locale.getString('spatial.success_create_report'), 'success');
        loadingStatus.isLoading('SaveReport',false);
    };

    var createReportError = function(error){
        reportError(error,'spatial.error_create_report');
        loadingStatus.isLoading('SaveReport',false);
    };

    var updateReportSuccess = function(response){
        reportService.loadReportHistory();
        if($scope.repNav.hasPreviousState()){
            $scope.repNav.goToPreviousView();
        }else{
            $scope.repNav.goToView('liveViewPanel','mapPanel',$scope.openReportList);
        }
        reportMsgService.show(locale.getString('spatial.success_update_report'), 'success');
        if ($scope.formMode === 'EDIT'){
            reportFormService.report = undefined;
        } else if ($scope.formMode === 'EDIT-FROM-LIVEVIEW'){
            angular.copy($scope.currentRepCopy,reportFormService.liveView.currentReport);
            delete $scope.currentRepCopy;
            angular.copy(reportFormService.liveView.currentReport, reportFormService.liveView.originalReport);
            reportFormService.liveView.outOfDate = false;
            reportService.runReport($scope.report);
        }
        loadingStatus.isLoading('SaveReport',false);
    };

    var updateReportError = function(error){
        angular.copy($scope.currentRepCopy,reportFormService.liveView.currentReport);
        delete $scope.currentRepCopy;
        reportError(error,'spatial.error_update_report');
        loadingStatus.isLoading('SaveReport',false);
    };

    var reportError = function(error, defaultMsg) {
        $scope.formAlert.visible = true;
        var errorMsg = defaultMsg;

        if (angular.isDefined(error.data.msg)) {
            var msg = error.data.msg;
            if (msg.indexOf('spatial') === -1){
                msg = 'spatial.' + msg;
            }
            errorMsg = locale.getString(msg);
        } else {
            errorMsg = locale.getString(defaultMsg);
        }
        
        $scope.formAlert.msg = errorMsg;
    };
    
    $scope.resetReport = function(){
        loadingStatus.isLoading('ResetReport',true);
    	$scope.reportForm.$setPristine();
    	reportRestService.getReport($scope.report.id).then(function(response){
    		$scope.init();
    	    angular.copy($scope.report.fromJson(response), $scope.report);
    	    $scope.report.currentMapConfig = {mapConfiguration: {}};
            if (angular.isDefined($scope.report.areas) && $scope.report.areas.length > 0){
                getAreaProperties(buildAreaPropArray());
            }
    	    angular.copy($scope.report.mapConfiguration,$scope.report.currentMapConfig.mapConfiguration);
            loadingStatus.isLoading('ResetReport',false);
    	}, function(error){
    		$anchorScroll();
    		$scope.formAlert.msg = locale.getString('spatial.error_entry_not_found');
    		$scope.formAlert.visible = true;
            loadingStatus.isLoading('ResetReport',false);
    	});
    };
    
    $scope.cancel = function(){
        if ($scope.formMode === 'EDIT-FROM-LIVEVIEW'){
            angular.copy(reportFormService.liveView.currentTempReport, reportFormService.liveView.currentReport);
            if (!angular.equals(reportFormService.liveView.currentReport, reportFormService.liveView.originalReport)){
                reportFormService.liveView.outOfDate = true;
            }
            reportFormService.liveView.currentTempReport = undefined;
        } else {
            reportFormService.report = undefined;
        }
        $scope.repNav.goToPreviousView();
    };
    
    var loadReportForm = function(){
        switch($scope.formMode){
            case 'CREATE':
                reportFormService.report = new Report();
                $scope.report = reportFormService.report;
                //FIXME remove the following line after fixing aggregation panel
                //$scope.report.sortFilters = [{"code":"fs","text":"Flag state"},{"code":"area","text":"Area"},{"code":"period","text":"Period","items":[{"code":"day","text":"Day"},{"code":"month","text":"Month"},{"code":"year","text":"Year"}],"value":"day"},{"code":"species","text":"Species"},{"code":"geartype","text":"Gear type"}];
                
                break;
            case 'EDIT':
                $scope.report = reportFormService.report;
                break;
            case 'EDIT-FROM-LIVEVIEW':
                $scope.report = reportFormService.liveView.currentReport;
                reportFormService.liveView.currentTempReport = angular.copy($scope.report);
                break;
        }
        
        $scope.init();

        if (angular.isDefined($scope.report.areas) && $scope.report.areas.length > 0){
            getAreaProperties(buildAreaPropArray());
        }
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

