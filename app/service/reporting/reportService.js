angular.module('unionvmsWeb').factory('reportService',function($rootScope, $timeout, $interval, $anchorScroll, locale, TreeModel, reportRestService, spatialRestService, spatialHelperService, defaultMapConfigs, mapService, unitConversionService, vmsVisibilityService, mapAlarmsService, loadingStatus, spatialConfigRestService, SpatialConfig, Report, globalSettingsService, userService) {

    var rep = {
       id: undefined,
       name: undefined,
       isReportExecuting: false,
       isReportRefreshing: false,
       hasAlert: false, 
       message: undefined,
       alertType: undefined,
       tabs: {
           map: true,
           vms: true
       },
       positions: [],
       segments: [],
       tracks: [],
       refresh: {
            status: false,
            rate: undefined
       },
       selectedTab: 'MAP',
       errorLoadingDefault: false,
       liveviewEnabled: false,
       isLiveViewActive: false,
       outOfDate: undefined,
       getConfigsTime: undefined,
       getReportTime: undefined,
       mapConfigs: undefined
    };
    
    rep.clearVmsData = function(){
        rep.id = undefined;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
    };
    
    rep.resetReport = function(){
        rep.name = locale.getString('spatial.header_live_view');
        rep.tabs.map = true;
        rep.refresh.status = false;
        rep.refresh.rate = undefined;
        rep.getConfigsTime = undefined;
        rep.getReportTime = undefined;
        rep.mapConfigs = undefined;
        
        //Clear data used in tables
        rep.clearVmsData();
        
        //Reset labels
        mapService.resetLabelContainers();
        
        //Reset map projection
        mapService.updateMapView({
            epsgCode: 3857,
            units: 'm',
            global: true,
            axis: 'enu',
            extent: '-20026376.39;-20048966.10;20026376.39;20048966.10'
        });
        
        //Reset layer to OSM
        var treeSource = new TreeModel();
        treeSource = treeSource.fromConfig({
            baseLayers: [{
                isBaseLayer: true,
                title: 'OpenStreetMap',
                type: 'OSM'
            }]
        });
        $rootScope.$broadcast('updateLayerTreeSource', treeSource);
    };
    
    rep.stopRunInterval = function(){
        $interval.cancel(rep.runInterval);
        rep.runInterval = undefined;
    };
    
	rep.runReport = function(report){
		rep.isReportExecuting = true;
		rep.outOfDate = false;
		
		rep.runInterval = $interval(function(){
		    var mapContainer = angular.element('#map');
		    if (mapContainer.length > 0){
		        rep.stopRunInterval();
		        
		        prepareReportToRun(report);
		        rep.getConfigsTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
		        if (rep.tabs.map === true){
		            spatialRestService.getConfigsForReport(rep.id, rep.getConfigsTime).then(getConfigSuccess, getConfigError);
		        } else {
		            spatialRestService.getConfigsForReportWithoutMap(rep.getConfigsTime).then(getConfigWithouMapSuccess, getConfigWithouMapError); 
		        }
		    }
		}, 10);
	};
	
	rep.runReportWithoutSaving = function(report){
		rep.outOfDate = true;
		rep.isReportExecuting = true;
		rep.reportToRun = report;
    	spatialConfigRestService.getUserConfigs().then(getUserConfigsSuccess, getUserConfigsFailure);
	};
	
	rep.clearMapOverlaysOnRefresh = function(){
	    //Check for measuring overlays
	    $rootScope.$broadcast('untoggleToolbarBtns');
	    
	    //Deactivate labels
        if (mapService .vmsposLabels.active === true){
            mapService.deactivateVectorLabels('vmspos');
        }
        if (mapService.vmssegLabels.active === true){
            mapService.deactivateVectorLabels('vmsseg');
        }
        mapService.resetLabelContainers();
        
        //Deactivate popups
        if (angular.isDefined(mapService.activeLayerType)){
            mapService.closePopup();
            mapService.activeLayerType = undefined;
        }
	};
	
	rep.refreshReport = function(){
		console.log("refrescou");
	    if (angular.isDefined(rep.id) && rep.tabs.map === true ){
	        rep.clearMapOverlaysOnRefresh();
	        rep.isReportRefreshing = true;
	        var repConfig = getRepConfig();
	        if(rep.outOfDate){
	        	rep.runReportWithoutSaving(rep.reportToRun);
	        }else{
	        	rep.runReport(undefined);
	        }
	    }
	};

    
    rep.setAutoRefresh = function() {    
       $timeout(function() {
          if (rep.isReportExecuting === false && rep.isLiveViewActive === true && rep.refresh.status === true) {
            rep.refreshReport();
          }
           rep.setAutoRefresh();
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
		if(!angular.equals(rep.lastConfig,data)){
			rep.lastConfig = data;
			configureMap(data);
		}
        var repConfig = getRepConfig();
        
	    reportRestService.executeReport(rep.id,repConfig).then(getVmsDataSuccess, getVmsDataError);

        if (rep.refresh.status === true) {
            rep.setAutoRefresh();
        }
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
    var getConfigWithouMapSuccess = function(data){
        //Set vms table attribute visibility
        vmsVisibilityService.setVisibility(data.visibilitySettings);
        
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
        var repConfig = getRepConfig();
        reportRestService.executeReport(rep.id,repConfig).then(getVmsDataSuccess, getVmsDataError);
    };
    
    //Get config without map Success callback
    var getConfigWithouMapError = function(error){
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
                    $rootScope.$broadcast('addLayerTreeNode', alarmsNode);
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
	
	//Get VMS data Success callback
	var getVmsDataSuccess = function(data){
		rep.loadReportHistory();

		rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
		
		if(angular.isDefined(rep.mapConfigs)){
			if(angular.isDefined(rep.mapConfigs.stylesSettings)){
				if(angular.isDefined(rep.mapConfigs.styleSettings.positions)){
					rep.positions = rep.mapConfigs.styleSettings.positions.style;
				}
				if(angular.isDefined(rep.mapConfigs.stylesSettings.segments)){
					rep.segments = rep.mapConfigs.stylesSettings.segments.style;
				}
				if(angular.isDefined(rep.mapConfigs.stylesSettings.tracks)){
					rep.tracks = rep.mapConfigs.stylesSettings.tracks.style;
				}
			}
		}
        
        //Update map if the report contains the map tab
        if (rep.tabs.map === true){
            if (mapService.styles.positions.attribute === 'countryCode'){
                mapService.setDisplayedFlagStateCodes('positions', rep.positions);
            }
            
            if (mapService.styles.segments.attribute === 'countryCode'){
                mapService.setDisplayedFlagStateCodes('segments', rep.segments);
            }
            
            //Add nodes to the tree and layers to the map
            if (rep.positions.length > 0 || rep.segments.length > 0){
                var vectorNodeSource = new TreeModel();
                vectorNodeSource = vectorNodeSource.nodeFromData(data);
                
                $rootScope.$broadcast('addLayerTreeNode', vectorNodeSource);
                
                if (rep.selectedTab === 'MAP'){
                    mapService.zoomToPositionsLayer();
                }
            } else if (rep.positions.length === 0 && rep.segments.length === 0){
                rep.hasAlert = true;
                rep.alertType = 'warning';
                rep.message = locale.getString('spatial.map_no_vms_data');
            }
        }
        rep.isReportExecuting = false;
        rep.isReportRefreshing = false;
    };
    
    //Get VMS data Failure callback
    var getVmsDataError = function(error){
        rep.loadReportHistory();
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = true;
        rep.isReportExecuting = false;
        rep.isReportRefreshing = false;
        rep.hasAlert = true;
        rep.alertType = 'danger';
        rep.message = locale.getString('spatial.map_error_loading_report');
    };
    
    //Refresh report success callback
    var updateVmsDataSuccess = function(data){
        $rootScope.$broadcast('removeVmsNodes');
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
        
        //Remove existing vms vector layers from the map
        mapService.clearVectorLayers();
        
        //Add nodes to the tree and layers to the map
        if (rep.positions.length > 0 || rep.segments.length > 0){
            var vectorNodeSource = new TreeModel();
            vectorNodeSource = vectorNodeSource.nodeFromData(data);
            $rootScope.$broadcast('addLayerTreeNode', vectorNodeSource);
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
	    rep.liveviewEnabled = true;
	    rep.id = rep.isReportRefreshing ? rep.id : report.id;
	    rep.name = rep.isReportRefreshing ? rep.name :  report.name;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = rep.isReportRefreshing ? rep.tabs.map : report.withMap;
        
        mapService.resetLabelContainers();
        
        //This gets executed on initial loading when we have a default report
        if (!angular.isDefined(mapService.map) && rep.tabs.map){
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
                mapService.activeLayerType = undefined;
            }
            
            if (mapService.vmsposLabels.active === true){
                mapService.deactivateVectorLabels('vmspos');
            }
            
            if (mapService.vmssegLabels.active === true){
                mapService.deactivateVectorLabels('vmsseg'); 
            }
        }
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
	    vmsVisibilityService.setVisibility(data.visibilitySettings);
	    
	    //Set popup visibility settings
	    mapService.setPopupVisibility('positions', data.visibilitySettings.positions.popup);
	    mapService.setPopupVisibility('segments', data.visibilitySettings.segments.popup);
	    
	    //Set label visibility
	    mapService.setLabelVisibility('positions', data.visibilitySettings.positions.labels);
	    mapService.setLabelVisibility('segments', data.visibilitySettings.segments.labels);
	    
	    //Build tree object and update layer panel
	    var treeSource = new TreeModel();
	    treeSource = treeSource.fromConfig(data.map.layers);
	    $timeout(function() {
	        $rootScope.$broadcast('updateLayerTreeSource', treeSource);
	    });
	    
        //map refresh configs
        if (rep.tabs.map === true && angular.isDefined(data.map.refresh)){
        	if(rep.isReportRefreshing === false){
        		rep.refresh.status = data.map.refresh.status;
        	}
            rep.refresh.rate = data.map.refresh.rate;   
        }
        
        mapService.updateMapSize();
        
	    //Finally load VMS positions and segments
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
	};
	
	var getUserConfigsSuccess = function(response){
	    var model = new SpatialConfig();
	    if(!angular.equals(rep.lastConfig,response)){
			rep.lastConfig = response;
			var userConfig = model.forUserPrefFromJson(response);
	        rep.mergedReport = mergeSettings(userConfig);
		}
        
        spatialConfigRestService.getMapConfigsFromReport(getMapConfigs()).then(getMapConfigsFromReportSuccess, getMapConfigsFromReportFailure);
	};
	
	var getUserConfigsFailure = function(error){
	    $anchorScroll();
	    rep.hasAlert = true;
	    rep.alertType = 'danger';
        rep.message = locale.getString('spatial.user_preferences_error_getting_configs');
	    rep.isReportRefreshing = false;
		rep.isReportExecuting = false;
	};
	
	var mergeSettings = function(userConfig){
    	var mergedReport = new Report();
    	angular.copy(rep.reportToRun, mergedReport);
    	
    	if(!angular.isDefined(mergedReport.currentConfig.mapConfiguration.mapProjectionId) && 
    			!angular.isDefined(mergedReport.currentConfig.mapConfiguration.displayProjectionId) && !angular.isDefined(mergedReport.currentConfig.mapConfiguration.coordinatesFormat) && 
    			!angular.isDefined(mergedReport.currentConfig.mapConfiguration.scaleBarUnits)){
    		
    		mergedReport.currentConfig.mapConfiguration.spatialConnectId = userConfig.mapSettings.spatialConnectId;
    		mergedReport.currentConfig.mapConfiguration.mapProjectionId = userConfig.mapSettings.mapProjectionId;
    		mergedReport.currentConfig.mapConfiguration.displayProjectionId = userConfig.mapSettings.displayProjectionId;
    		mergedReport.currentConfig.mapConfiguration.coordinatesFormat = userConfig.mapSettings.coordinatesFormat;
    		mergedReport.currentConfig.mapConfiguration.scaleBarUnits = userConfig.mapSettings.scaleBarUnits;
    	}
    	
    	if(!angular.isDefined(mergedReport.currentConfig.mapConfiguration.stylesSettings)){
    		mergedReport.currentConfig.mapConfiguration.stylesSettings = userConfig.stylesSettings;
    	}
    	
    	if(!angular.isDefined(mergedReport.currentConfig.mapConfiguration.layerSettings)){
    		mergedReport.currentConfig.mapConfiguration.layerSettings = userConfig.layerSettings;
    	}
    	mergedReport.currentConfig.mapConfiguration.layerSettings = rep.checkLayerSettings(mergedReport.currentConfig.mapConfiguration.layerSettings);
    	
    	if(!angular.isDefined(mergedReport.currentConfig.mapConfiguration.visibilitySettings)){
    		mergedReport.currentConfig.mapConfiguration.visibilitySettings = userConfig.visibilitySettings;
    	}

		if(!angular.isDefined(mergedReport.currentConfig.mapConfiguration.referenceDataSettings)){
    		mergedReport.currentConfig.mapConfiguration.referenceDataSettings = userConfig.referenceDataSettings;
    	}
    	
    	return mergedReport;
    };
    
    var getMapConfigs = function(){
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
				mapProjectionId: rep.mergedReport.currentConfig.mapConfiguration.mapProjectionId,
				displayProjectionId: rep.mergedReport.currentConfig.mapConfiguration.displayProjectionId,
				coordinatesFormat: rep.mergedReport.currentConfig.mapConfiguration.coordinatesFormat,
				scaleBarUnits: rep.mergedReport.currentConfig.mapConfiguration.scaleBarUnits
			},
			stylesSettings: rep.mergedReport.currentConfig.mapConfiguration.stylesSettings,
			layerSettings: rep.mergedReport.currentConfig.mapConfiguration.layerSettings,
			visibilitySettings: rep.mergedReport.currentConfig.mapConfiguration.visibilitySettings,
			referenceDataSettings: rep.mergedReport.currentConfig.mapConfiguration.referenceDataSettings,
			reportProperties: {
		        startDate : rep.mergedReport.startDateTime === undefined ? undefined : moment.utc(rep.mergedReport.startDateTime, globalSettingsService.getDateFormat()).format('YYYY-MM-DDTHH:mm:ss'),
		        endDate : rep.mergedReport.endDateTime === undefined ? undefined : moment.utc(rep.mergedReport.endDateTime, globalSettingsService.getDateFormat()).format('YYYY-MM-DDTHH:mm:ss')
			}
		};
	};
	
	var getMapConfigsFromReportSuccess = function(data){
		angular.copy(rep.mergedReport.currentConfig.mapConfiguration,rep.mergedReport.mapConfiguration);
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
	
	rep.checkLayerSettings = function(layerSettings) {
        
	    if(angular.isDefined(layerSettings)){
	        var layerData = {};
			if(angular.isDefined(layerSettings.portLayers) && !_.isEmpty(layerSettings.portLayers)){
	    		var ports = [];
	    		angular.forEach(layerSettings.portLayers, function(value,key) {
	    			var port = {'serviceLayerId': value.serviceLayerId, 'order': key};
		    		ports.push(port);
		    	});
	    		layerSettings.portLayers = [];
	    		angular.copy(ports,layerSettings.portLayers);
	    	}else if(!angular.isDefined(layerSettings.portLayers)){
	    		layerSettings.portLayers = undefined;
	    	}
		
	    	if(angular.isDefined(layerSettings.areaLayers && !_.isEmpty(layerSettings.areaLayers))){
	    		var areas = [];
	    		angular.forEach(layerSettings.areaLayers, function(value,key) {
	    			var area;
	    			switch (value.areaType) {
		    			case 'sysarea':
		    				area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'order': key};
		    				break;
		    			case 'userarea':
		    				area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'gid': value.gid, 'order': key};
		    				break;
		    			case 'areagroup':
		    				area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'areaGroupName': value.name, 'order': key};
		    				break;
		    		}
	    			areas.push(area);
		    	});
	    		layerSettings.areaLayers = [];
	    		angular.copy(areas,layerSettings.areaLayers);
			}else{
				layerSettings.areaLayers = undefined;
			}
	    	
	    	if(angular.isDefined(layerSettings.additionalLayers) && !_.isEmpty(layerSettings.additionalLayers)){
	    		var additionals = [];
	    		angular.forEach(layerSettings.additionalLayers, function(value,key) {
	    			var additional = {'serviceLayerId': value.serviceLayerId, 'order': key};
	    			additionals.push(additional);
		    	});
	    		layerSettings.additionalLayers = [];
	    		angular.copy(additionals,layerSettings.additionalLayers);
	    	}else{
				layerSettings.additionalLayers = undefined;
			}
	    	
	    	if(angular.isDefined(layerSettings.baseLayers) && !_.isEmpty(layerSettings.baseLayers)){
	    		var bases = [];
	    		angular.forEach(layerSettings.baseLayers, function(value,key) {
	    			var base = {'serviceLayerId': value.serviceLayerId, 'order': key};
	    			bases.push(base);
		    	});
	    		layerSettings.baseLayers = [];
	    		angular.copy(bases,layerSettings.baseLayers);
	    	}else{
				layerSettings.baseLayers = undefined;
			}
		}
	    return layerSettings;
    };

	return rep;
});