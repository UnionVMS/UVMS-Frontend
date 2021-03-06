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
angular.module('unionvmsWeb').factory('reportService',function($rootScope, $compile, $timeout, $interval, $anchorScroll, locale, TreeModel, reportRestService, reportFormService, spatialRestService, spatialHelperService, defaultMapConfigs, mapService, unitConversionService, visibilityService, mapAlarmsService, loadingStatus, spatialConfigRestService, SpatialConfig, Report, globalSettingsService, userService, reportingNavigatorService, $modalStack, layerPanelService,tripReportsTimeline, tripSummaryService, mapStateService) {

    var rep = {
       id: undefined,
       name: undefined,
       isReportExecuting: false,
       isReportRefreshing: false,
       hasAlert: false, 
       hideCatchDetails : false,
       message: undefined,
       alertType: undefined,
       positions: [],
       segments: [],
       tracks: [],
       alarms: [],
       trips: [],
       activities: [],
       refresh: {
            status: false,
            rate: undefined
       },
       errorLoadingDefault: false,
       lastMapConfigs: undefined,
       getConfigsTime: undefined,
       getReportTime: undefined
    };
    
    rep.clearVmsData = function(){
        rep.id = undefined;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.alarms = [];
        rep.trips = [];
        rep.activities = [];
    };
    
    rep.resetReport = function(){
        rep.name = locale.getString('spatial.header_live_view');
        rep.refresh.status = false;
        rep.refresh.rate = undefined;
        rep.getConfigsTime = undefined;
        rep.getReportTime = undefined;
        
        //Clear data used in tables
        rep.clearVmsData();
        
        //Reset labels
        mapService.resetLabelContainers();
        
        //Clear report form service
        reportFormService.resetLiveView();
        
        //Reset map projection
        if (angular.isDefined(mapService.map)){
            mapService.updateMapView({
                epsgCode: 3857,
                units: 'm',
                global: true,
                axis: 'enu',
                extent: '-20026376.39;-20048966.10;20026376.39;20048966.10'
            });
            
            //Reset layer tree
            layerPanelService.updateLayerTreeSource([]);
        }
    };
    
    rep.stopRunInterval = function(){
        $interval.cancel(rep.runInterval);
        rep.runInterval = undefined;
    };
    

    var runSummaryReport = function(){
        $modalStack.dismissAll();
    };

	rep.runReport = function(report){
        rep.clearMapOverlays();
        loadingStatus.isLoading('LiveviewMap',true, 0);
        spatialHelperService.fromFAView = false;

        tripReportsTimeline.reset();
        
        if(angular.isDefined(report)){
            rep.reportType = report.reportType;
        }
        rep.hasAlert = false;
        $modalStack.dismissAll();
        if (angular.isDefined(rep.autoRefreshInterval)){
            rep.stopAutoRefreshInterval();
        }
        
        rep.isReportExecuting = true;
        var prevRepId, prevRepEditable;
        if (angular.isDefined(reportFormService.liveView.currentReport)){
            prevRepId = reportFormService.liveView.currentReport.id;
            prevRepEditable = reportFormService.liveView.editable;
        }
        
        if (!angular.isDefined(report) && !angular.isDefined(reportFormService.liveView.currentReport)){
            prevRepId = rep.id;
            prevRepEditable = reportFormService.liveView.editable;
        }
        
        reportFormService.resetLiveView();
        
        var editable = false;
        if (angular.isDefined(report)){
            if (angular.isDefined(report.editable)){
                editable = report.editable;
            } 
            
            if (angular.isDefined(prevRepId) && prevRepId === report.id && !angular.isDefined(report.editable)){
                editable = prevRepEditable;
            }
        } else {
            //here we are always refreshing a report
            editable = prevRepEditable;
        }
        
        reportFormService.liveView.editable = editable;
        
        rep.runInterval = $interval(function(){
            var mapContainer = angular.element('#map');
            if (mapContainer.length > 0){
                prepareReportToRun(report);
                rep.getConfigsTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                
                if ((report && report.withMap) || rep.isReportRefreshing){
                    tripSummaryService.withMap = true;
                    spatialRestService.getConfigsForReport(rep.id, rep.getConfigsTime).then(getConfigSuccess, getConfigError);
                    reportingNavigatorService.goToView('liveViewPanel','mapPanel');
                    loadingStatus.isLoading('InitialReporting', false);
                } else {
                    tripSummaryService.withMap = false;
                    spatialRestService.getConfigsForReportWithoutMap(rep.getConfigsTime).then(getConfigWithoutMapSuccess, getConfigWithoutMapError);
                    if(rep.reportType === 'summary'){
                        tripSummaryService.trip = undefined;
                        rep.hideCatchDetails = true;
                        reportingNavigatorService.goToView('liveViewPanel','catchDetails');
                    }else{
                        reportingNavigatorService.goToView('liveViewPanel','vmsPanel');
                    }
                    loadingStatus.isLoading('InitialReporting', false);
                }
                
                rep.stopRunInterval();
            }
        }, 10);
	};
	
	rep.runReportWithoutSaving = function(report, preserveMapState){
	    if (angular.isDefined(preserveMapState) && preserveMapState === true){
            setStateProperties();
        }
        rep.clearMapOverlays();
	    loadingStatus.isLoading('LiveviewMap',true, 0);
        spatialHelperService.fromFAView = false;
	    tripReportsTimeline.reset();
	    rep.hasAlert = false;
        $modalStack.dismissAll();
	    if (angular.isDefined(rep.autoRefreshInterval)){
            rep.stopAutoRefreshInterval();
        }
		rep.isReportExecuting = true;
		rep.mergedReport = angular.copy(report); 
        if(rep.mergedReport.withMap && rep.mergedReport.reportType === 'standard'){
            spatialConfigRestService.getUserConfigs().then(getUserConfigsSuccess, getUserConfigsFailure);
            reportingNavigatorService.goToView('liveViewPanel','mapPanel');
            loadingStatus.isLoading('InitialReporting', false);
        }else{
            if(rep.reportType === 'summary'){
                prepareReportToRun(rep.mergedReport);
                
                rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                rep.mergedReport.additionalProperties = getUnitSettings();
                
                reportRestService.executeWithoutSaving(rep.mergedReport).then(getVmsDataSuccess, getVmsDataError);
                tripSummaryService.trip = undefined;
                rep.hideCatchDetails = true;
                reportingNavigatorService.goToView('liveViewPanel','catchDetails');
            }else{
                spatialConfigRestService.getUserConfigs().then(getUserConfigsSuccess, getUserConfigsFailure);
                reportingNavigatorService.goToView('liveViewPanel','vmsPanel');
            }
            loadingStatus.isLoading('InitialReporting', false);
        }
	};
	
	rep.clearMapOverlays = function(){
	    //Check for measuring overlays
        rep.untoggleToolbarBtns();
	    
	    //Deactivate labels
        if (mapService .vmsposLabels.active === true){
            mapService.deactivateVectorLabels('vmspos');
        }
        if (mapService.vmssegLabels.active === true){
            mapService.deactivateVectorLabels('vmsseg');
        }
        mapService.resetLabelContainers();
        
        //Deactivate popups
        if (mapService.popupRecContainer.records.length > 0){
            mapService.closePopup();
        }
	};

	var setStateProperties = function(){
	    var state = {
	        repId: rep.id,
            mapExtent: mapService.getMapExtent(),
            treeStatus: layerPanelService.getLayerTreeStatus(undefined),
            vmsStatus: layerPanelService.getLayerTreeStatus('vmsdata'),
            ersStatus: layerPanelService.getLayerTreeStatus('ers')
            //TODO ALARMS
        };
        mapStateService.toStorage(state);
    };
	
	rep.refreshReport = function(){
	    if (angular.isDefined(rep.id)){
	        setStateProperties();
	        rep.clearMapOverlays();
	        rep.isReportRefreshing = true;
	        if(reportFormService.liveView.outOfDate){
	        	rep.runReportWithoutSaving(rep.mergedReport);
	        }else{
	        	rep.runReport(undefined);
	        }
	    }
	};

    rep.stopAutoRefreshInterval = function(){
        $interval.cancel(rep.autoRefreshInterval);
        rep.autoRefreshInterval = undefined;
    };
	
    rep.setAutoRefresh = function() {
        if (angular.isDefined(rep.autoRefreshInterval)){
            rep.stopAutoRefreshInterval();
        }
        
        rep.autoRefreshInterval = $interval(function() {
            if (rep.isReportExecuting === false && rep.refresh.status === true && reportingNavigatorService.isViewVisible('mapPanel')) {
                rep.refreshReport();
            }
        }, rep.refresh.rate*60*1000); //timeout in minutes
    };
    
    rep.getAlarms = function(){
        loadingStatus.isLoading('LiveviewMap',true,1);
        var payload = mapAlarmsService.prepareDataForRequest();
        if (payload.length > 0){
            mapAlarmsService.getAlarms(payload).then(getAlarmsSuccess, getAlarmsError);
        } else {
            rep.hasAlert = true;
            rep.alertType = 'warning';
            rep.message = locale.getString('spatial.map_no_positions_for_alarms_data');
            loadingStatus.isLoading('LiveviewMap', false);
        }
    };
	
	var getUnitSettings = function(){
	    return {
    		speedUnit: unitConversionService.speed.getUnit(),
	        distanceUnit: unitConversionService.distance.getUnit(),
	        timestamp: rep.getReportTime
	    };
	};
	
	//Get Spatial config Success callback
	var getConfigSuccess = function(data){
		if(!angular.equals(rep.lastMapConfigs, data)){
			rep.lastMapConfigs = data;
			configureMap(data);
		}
        var repConfig = getRepConfig();
        
	    reportRestService.executeReport(rep.id,repConfig).then(getVmsDataSuccess, getVmsDataError);
	};
	
	//Get Spatial config Error callback
	var getConfigError = function(error){
        rep.loadReportHistory();
	    rep.isReportExecuting = false;
	    rep.isReportRefreshing = false;
	    rep.hasAlert = true;
	    rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_loading_report');
        rep.refresh.status = false;
        loadingStatus.isLoading('LiveviewMap', false);
        mapStateService.clearState();
	};
	
	var getRepConfig = function(){
	    var unitSettings = getUnitSettings();
	    return {
	        'speedUnit': unitSettings.speedUnit,
            'distanceUnit': unitSettings.distanceUnit,
            'additionalProperties': {
                'timestamp': unitSettings.timestamp
            }
	    };
	};
	
	//Get config without map Success callback
    var getConfigWithoutMapSuccess = function(data){
        //Set vms table attribute visibility
        visibilityService.setVisibility(data.visibilitySettings);
        
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
        var repConfig = getRepConfig();
        reportRestService.executeReport(rep.id,repConfig).then(getVmsDataSuccess, getVmsDataError);

        if(rep.reportType === 'summary'){
            var elems = angular.element('[ng-controller="VmspanelCtrl"] .modal-body input');
            angular.forEach(elems,function(el){
                var elem = $(el); 
                elem.val('');
                if(elem.hasClass('hidden-st-control')){
                    elem.trigger('input');
                }
            });
        }
    };
    
    //Get config without map Success callback
    var getConfigWithoutMapError = function(error){
        rep.isReportExecuting = false;
        rep.hasAlert = true;
        rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_loading_report');
    };
    
    //Get Alarms data Success callback
    var getAlarmsSuccess = function(response){
        if (angular.isDefined(response.data)){
            var featureCollection = response.data.alarms;
            if (featureCollection.features.length > 0){
                rep.alarms = response.data.alarms.features;
                //Check if alarms layer is already added to the map
                var layer = mapService.getLayerByType('alarms');
                if (angular.isDefined(layer)){ //if so we clear all features and add new ones
                    var src = layer.getSource();
                    src.clear();
                    var features = (new ol.format.GeoJSON()).readFeatures(featureCollection);
                    src.addFeatures(features);
                } else { //if not we create the layer and add the node to the tree
                    var alarmsNode = new TreeModel();
                    alarmsNode = alarmsNode.nodeForAlarms(featureCollection);
                    layerPanelService.addLayerTreeNode(alarmsNode);
                }
            }
        } else {
            rep.hasAlert = true;
            rep.alertType = 'warning';
            rep.message = locale.getString('spatial.map_no_alarms_data');
        }
        loadingStatus.isLoading('LiveviewMap', false);
    };
    
    var getAlarmsError = function(error){
        rep.hasAlert = true;
        rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_alarms_data');
        loadingStatus.isLoading('LiveviewMap', false);
    };

    var updateVmsTreeSource = function(nodes, prevState, propertyName){
        angular.forEach(nodes, function (node) {
            var searchObj = {};
            searchObj[propertyName] = node[propertyName];
            var state = _.findWhere(prevState, searchObj);
            if (angular.isDefined(state)){
                if (angular.isDefined(state.expanded)){
                    node.expanded = state.expanded;
                }
                node.selected = state.selected;
                if (angular.isDefined(node.children) && node.children.length > 0){
                    node.children = updateVmsTreeSource(node.children, state.children, 'filterType');
                }
            }
        });

        return nodes;
    };

	//Get VMS data Success callback
	var getVmsDataSuccess = function(data){
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
        rep.trips = data.trips;
        rep.activities = data.activities.features;
        rep.criteria = data.criteria;

        if(rep.reportType === 'standard'){
            rep.loadReportHistory();

            //Update map if the report contains the map tab
            if (reportingNavigatorService.isViewVisible('mapPanel')){
                if (mapService.styles.positions.attribute === 'countryCode'){
                    mapService.setDisplayedFlagStateCodes('positions', rep.positions);
                }
                
                if (mapService.styles.segments.attribute === 'countryCode'){
                    mapService.setDisplayedFlagStateCodes('segments', rep.segments);
                }
                
                //Add nodes to the tree and layers to the map
                if (rep.positions.length > 0 || rep.segments.length > 0 || rep.activities.length > 0){
                    var vectorNodeSource = new TreeModel();
                    vectorNodeSource = vectorNodeSource.nodeFromData(data);

                    var previousLayerState = mapStateService.fromStorage();
                    if (angular.isDefined(previousLayerState) && previousLayerState.repId === rep.id){
                        angular.forEach(vectorNodeSource, function(node){
                            if (node.type === 'vmsdata' && previousLayerState.vmsStatus.length > 0){
                                node.expanded = previousLayerState.vmsStatus[0].expanded;
                                node.selected = previousLayerState.vmsStatus[0].selected;
                                node.children = updateVmsTreeSource(node.children, previousLayerState.vmsStatus[0].children, 'title');
                            }

                            if (angular.isUndefined(node.type) && angular.isDefined(node.data) && node.data.filterProperty === 'activityType' && previousLayerState.ersStatus.length > 0){
                                node.expanded = previousLayerState.ersStatus[0].expanded;
                                node.selected = previousLayerState.ersStatus[0].selected;
                                node.children = updateVmsTreeSource(node.children, previousLayerState.ersStatus[0].children, 'title');
                            }
                        });
                    }
                    
                    layerPanelService.addLayerTreeNode(vectorNodeSource);
                    
                    if (reportingNavigatorService.isViewVisible('mapPanel') && angular.isUndefined(previousLayerState)){
                        mapService.zoomToPositionsLayer();
                    }
                } else if (rep.positions.length === 0 && rep.segments.length === 0){
                    rep.hasAlert = true;
                    rep.alertType = 'warning';
                    rep.message = locale.getString('spatial.map_no_vms_data');
                }
            }

            if (rep.refresh.status === true) {
                rep.setAutoRefresh();
            }

            mapStateService.clearState();
        }else{
            if(!angular.isDefined(rep.criteria.recordDTOs) || rep.criteria.recordDTOs.length === 0){           
                rep.hasAlert = true;
                rep.alertType = 'warning';
                rep.hideCatchDetails = false;
                rep.message = locale.getString('spatial.report_no_ers_data');
            }else{  
                tripSummaryService.trip = undefined;
                rep.hideCatchDetails = true;
                reportingNavigatorService.goToView('liveViewPanel','catchDetails');           
            }
        }
        
        loadingStatus.isLoading('LiveviewMap', false);
        rep.isReportExecuting = false;
        rep.isReportRefreshing = false;
    };
    
    //Get VMS data Failure callback
    var getVmsDataError = function(error){
        rep.loadReportHistory();
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.isReportExecuting = false;
        rep.isReportRefreshing = false;
        rep.hasAlert = true;
        rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_loading_report');
        rep.refresh.status = false;
        loadingStatus.isLoading('LiveviewMap', false);
        mapStateService.clearState();
    };
    
    //Refresh report success callback
    var updateVmsDataSuccess = function(data){
        layerPanelService.removeVmsNodes();
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
        //TODO activities
        
        //Remove existing vms vector layers from the map
        mapService.clearVectorLayers();
        
        //Add nodes to the tree and layers to the map
        if (rep.positions.length > 0 || rep.segments.length > 0){
            var vectorNodeSource = new TreeModel();
            vectorNodeSource = vectorNodeSource.nodeFromData(data);
            layerPanelService.addLayerTreeNode(vectorNodeSource);
        } else if (rep.positions.length === 0 && rep.segments.length === 0){
            rep.hasAlert = true;
            rep.alertType = 'warning';
            rep.message = locale.getString('spatial.map_no_vms_data');
        }
        rep.isReportExecuting = false;
    };
    
    //Refresh report failure callback
    var updateVmsDataError = function(error){
        rep.isReportExecuting = false;
        rep.hasAlert = true;
        rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_loading_report');
    };
    
    var prepareReportToRun = function(report){
	    rep.id = rep.isReportRefreshing ? rep.id : report.id;
	    rep.name = rep.isReportRefreshing ? rep.name :  report.name;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        //TODO activities
        
        mapService.resetLabelContainers();
        
        //This gets executed on initial loading when we have a default report
        if (!angular.isDefined(mapService.map) && report.withMap && report.reportType === 'standard'){
            mapService.setMap(defaultMapConfigs);
        } else if (angular.isDefined(mapService.map)) {
            mapService.clearVectorLayers();
            
            //Reset history control
            var history = mapService.getControlsByType('HistoryControl')[0];
            if (angular.isDefined(history)){
                history.resetHistory();
            }
            
            //Close overlays
            if (angular.isDefined(mapService.overlay)){
                mapService.closePopup();
            }
            
            if (mapService.vmsposLabels.active === true){
                mapService.deactivateVectorLabels('vmspos');
            }
            
            if (mapService.vmssegLabels.active === true){
                mapService.deactivateVectorLabels('vmsseg'); 
            }
        }
	};

    var adjustTreeSource = function(oldTreeSource, treeSourceFromCfg){
        var newTreeSource = [];
        angular.forEach(oldTreeSource, function(node){
            var nodeCfgFromServer = _.findWhere(treeSourceFromCfg, {title: node.title});
            if (angular.isDefined(node.expanded)){
                nodeCfgFromServer.expanded = node.expanded;
            }
            nodeCfgFromServer.selected = node.selected;
            if (angular.isDefined(node.children) && node.children.length > 0){
                var children = _.clone(nodeCfgFromServer.children);
                delete nodeCfgFromServer.children;
                nodeCfgFromServer.children = adjustTreeSource(node.children, children);
            }

            if (angular.isDefined(node.params)){
                nodeCfgFromServer.data.params.STYLES = node.params.STYLES;
            }

            if (angular.isDefined(node.contextItems)){
                if (angular.isDefined(node.contextItems.geomLabelStyle)){
                    nodeCfgFromServer.data.contextItems.geomLabelStyle = node.contextItems.geomLabelStyle;
                }
                if (angular.isDefined(node.contextItems.geomStyle)){
                    nodeCfgFromServer.data.contextItems.geomStyle = node.contextItems.geomStyle;
                }
                if (angular.isDefined(node.contextItems.labelStyle)){
                    nodeCfgFromServer.data.contextItems.labelStyle = node.contextItems.labelStyle;
                }
                if (angular.isDefined(node.contextItems.cqlHeader)){
                    nodeCfgFromServer.data.contextItems.activeAreas = node.contextItems.activeAreas;
                    nodeCfgFromServer.data.contextItems.allAreas = node.contextItems.allAreas;
                    if (node.contextItems.allAreas.selected === true){
                        nodeCfgFromServer.data.params.cql_filter = null;
                    }
                }
            }
            this.push(nodeCfgFromServer);
        }, newTreeSource);

        return newTreeSource;
    };
	
	var configureMap = function(data){
	    //Change map ol.View configuration
	    if (mapService.getMapProjectionCode() !== 'EPSG:' + data.map.projection.epsgCode){
	        mapService.updateMapView(data.map.projection);
	    }
	    
	    //Set map controls
	    mapService.updateMapControls(data.map.control);
	    
	    //Set toolbar controls
	    spatialHelperService.setToolbarControls(data);
	    
	    //Set the styles for vector layers and legend
	    mapService.setPositionStylesObj(data.vectorStyles.positions); 
	    mapService.setSegmentStylesObj(data.vectorStyles.segments);
	    mapService.setAlarmsStylesObj(data.vectorStyles.alarms);
	    
	    //Set vms table attribute visibility
	    visibilityService.setVisibility(data.visibilitySettings);
	    
	    //Set popup visibility settings
	    mapService.setPopupVisibility('positions', data.visibilitySettings.positions.popup);
	    mapService.setPopupVisibility('segments', data.visibilitySettings.segments.popup);
	    //mapService.setPopupVisibility('activities', data.visibilitySettings.activities.popup); FIXME
	    
	    //Set label visibility
	    mapService.setLabelVisibility('positions', data.visibilitySettings.positions.labels);
	    mapService.setLabelVisibility('segments', data.visibilitySettings.segments.labels);
	    //mapService.setLabelVisibility('activities', data.visibilitySettings.activities.labels); FIXME
	    
	    //Build tree object and update layer panel

        var treeSource = new TreeModel();
        treeSource = treeSource.fromConfig(data.map.layers);

        //Maintain the map state if map is being refreshed
        var previousLayerState = mapStateService.fromStorage();
        if (angular.isDefined(previousLayerState) && previousLayerState.repId === rep.id){
            treeSource = adjustTreeSource(previousLayerState.treeStatus, treeSource);
        }

	    $timeout(function() {
            layerPanelService.updateLayerTreeSource(treeSource);
	    });
	    
        //map refresh configs
        if (reportingNavigatorService.isViewVisible('mapPanel') && angular.isDefined(data.map.refresh)){
        	if(rep.isReportRefreshing === false){
        		rep.refresh.status = data.map.refresh.status;
        	}
            rep.refresh.rate = data.map.refresh.rate;   
        }
        
        mapService.updateMapSize();
        
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
	};
	
	var getUserConfigsSuccess = function(response){
	    rep.lastMapConfigs = response;
	    
	    var model = new SpatialConfig();
	    var userConfig = model.forUserPrefFromJson(response);
	    
	    mergeSettings(userConfig);

        spatialConfigRestService.getMapConfigsFromReport(getMapConfigs(userConfig)).then(getMapConfigsFromReportSuccess, getMapConfigsFromReportFailure);
	};
	
	var getUserConfigsFailure = function(error){
	    $anchorScroll();
	    rep.hasAlert = true;
	    rep.alertType = 'danger';
        rep.message = locale.getString('spatial.user_preferences_error_getting_configs');
	    rep.isReportRefreshing = false;
		rep.isReportExecuting = false;
		loadingStatus.isLoading('LiveviewMap', false);
	};
	
	var mergeSettings = function(userConfig){
    	if(!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.mapProjectionId) && 
    			!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.displayProjectionId) && !angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.coordinatesFormat) && 
    			!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.scaleBarUnits)){
    		
    		rep.mergedReport.currentMapConfig.mapConfiguration.spatialConnectId = userConfig.mapSettings.spatialConnectId;
    		rep.mergedReport.currentMapConfig.mapConfiguration.mapProjectionId = userConfig.mapSettings.mapProjectionId;
    		rep.mergedReport.currentMapConfig.mapConfiguration.displayProjectionId = userConfig.mapSettings.displayProjectionId;
    		rep.mergedReport.currentMapConfig.mapConfiguration.coordinatesFormat = userConfig.mapSettings.coordinatesFormat;
    		rep.mergedReport.currentMapConfig.mapConfiguration.scaleBarUnits = userConfig.mapSettings.scaleBarUnits;
    	}
    	
    	if(!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.stylesSettings)){
    	    rep.mergedReport.currentMapConfig.mapConfiguration.stylesSettings = userConfig.stylesSettings;
    	}
    	
    	if(!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.layerSettings)){
    	    rep.mergedReport.currentMapConfig.mapConfiguration.layerSettings = userConfig.layerSettings;
    	}
    	rep.mergedReport.currentMapConfig.mapConfiguration.layerSettings = reportFormService.checkLayerSettings(rep.mergedReport.currentMapConfig.mapConfiguration.layerSettings);
    	
    	if(!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.visibilitySettings)){
    	    rep.mergedReport.currentMapConfig.mapConfiguration.visibilitySettings = userConfig.visibilitySettings;
    	}

		if(!angular.isDefined(rep.mergedReport.currentMapConfig.mapConfiguration.referenceDataSettings)){
		    rep.mergedReport.currentMapConfig.mapConfiguration.referenceDataSettings = userConfig.referenceDataSettings;
    	}
    	
    };
    
    var getMapConfigs = function(userConfig){
		return {
			toolSettings: {
			       "control": [
			                   {
			                       "type": "zoom"
			                   },
			                   {
			                       "type": "drag"
			                   },
			                   {
			                       "type": "scale"
			                   },
			                   {
			                       "type": "mousecoords"
			                   },
			                   {
			                       "type": "history"
			                   }
			               ],
			               "tbControl": [
			                   {
			                       "type": "measure"
			                   },
			                   {
			                       "type": "fullscreen"
			                   }
			               ]
			           },
			mapSettings: {
				mapProjectionId: rep.mergedReport.currentMapConfig.mapConfiguration.mapProjectionId,
				displayProjectionId: rep.mergedReport.currentMapConfig.mapConfiguration.displayProjectionId,
				coordinatesFormat: rep.mergedReport.currentMapConfig.mapConfiguration.coordinatesFormat,
				scaleBarUnits: rep.mergedReport.currentMapConfig.mapConfiguration.scaleBarUnits,
				refreshStatus: userConfig.mapSettings.refreshStatus,
				refreshRate: userConfig.mapSettings.refreshRate
			},
			stylesSettings: rep.mergedReport.currentMapConfig.mapConfiguration.stylesSettings,
			layerSettings: rep.mergedReport.currentMapConfig.mapConfiguration.layerSettings,
			visibilitySettings: rep.mergedReport.currentMapConfig.mapConfiguration.visibilitySettings,
			referenceDataSettings: rep.mergedReport.currentMapConfig.mapConfiguration.referenceDataSettings,
			reportProperties: {
		        startDate : rep.mergedReport.startDateTime === undefined ? undefined : moment.utc(rep.mergedReport.startDateTime, globalSettingsService.getDateFormat()).format('YYYY-MM-DDTHH:mm:ss'),
		        endDate : rep.mergedReport.endDateTime === undefined ? undefined : moment.utc(rep.mergedReport.endDateTime, globalSettingsService.getDateFormat()).format('YYYY-MM-DDTHH:mm:ss')
			}
		};
	};
	
	var getMapConfigsFromReportSuccess = function(data){
		prepareReportToRun(rep.mergedReport);
		configureMap(data[0]);
		
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
        rep.mergedReport.additionalProperties = getUnitSettings();
	    
        reportRestService.executeWithoutSaving(rep.mergedReport).then(getVmsDataSuccess, getVmsDataError);
	};
	
	var getMapConfigsFromReportFailure = function(error){
        rep.loadReportHistory();
	    $anchorScroll();
	    rep.hasAlert = true;
	    rep.alertType = 'danger';
        rep.message = locale.getString('spatial.user_preferences_error_getting_configs');
	    rep.isReportRefreshing = false;
		rep.isReportExecuting = false;
		loadingStatus.isLoading('LiveviewMap', false);
	};

	rep.loadReportHistory = function(){
        rep.loadingReportHistory = true;
        reportRestService.getLastExecuted(10).then(function(response){
            getReportHistory(response);
            rep.loadingReportHistory = false;
        }, function(error){
            $anchorScroll();
			rep.hasAlert = true;
            rep.alertType = 'danger';
            rep.message = locale.getString('spatial.error_loading_report_history');
            rep.loadingReportHistory = false;
        });
    };

    var getReportHistory = function(response){
        rep.reportsHistory = [];
        var username = userService.getUserName();
        var sectionMine = {'text': locale.getString('spatial.report_history_your_reports'), 'items': []};
        var sectionShared = {'text': locale.getString('spatial.report_history_shared_reports'), 'items': []};

        angular.forEach(response.data,function(item) {
            var newItem;
            if(username === item.createdBy){
                newItem = item;
                newItem.code = item.id;
                newItem.text = item.name;
                sectionMine.items.push(newItem);
            }else if(item.visibility !== 'private'){
                newItem = item;
                newItem.code = item.id;
                newItem.text = item.name;
                sectionShared.items.push(newItem);
            }
        });

        if(sectionMine.items.length){
            rep.reportsHistory.push(sectionMine);
        }
        if(sectionShared.items.length){
            rep.reportsHistory.push(sectionShared);
        }
    };
	
    $rootScope.$on('$stateChangeStart', function() {
        rep.hasAlert = false;
    });

	return rep;
});