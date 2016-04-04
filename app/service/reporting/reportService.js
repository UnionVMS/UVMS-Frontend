angular.module('unionvmsWeb').factory('reportService',function($rootScope, $timeout, locale, TreeModel, reportRestService, spatialRestService, spatialHelperService, defaultMapConfigs, mapService, unitConversionService, vmsVisibilityService, mapAlarmsService, loadingStatus) {

    var rep = {
       id: undefined,
       name: undefined,
       isReportExecuting: false,
       hasError: false,
       hasWarning: false,
       message: undefined,
       //isAlarms: false,
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
       defaultReportId: undefined,
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
    
	rep.runReport = function(report){
		rep.isReportExecuting = true;
		prepareReportToRun(report);

        rep.getConfigsTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
        if (report.withMap === true){
            spatialRestService.getConfigsForReport(report.id, rep.getConfigsTime).then(getConfigSuccess, getConfigError);
        } else {
            spatialRestService.getConfigsForReportWithoutMap(rep.getConfigsTime).then(getConfigWithouMapSuccess, getConfigWithouMapError); 
        }
	};
	
	rep.runReportWithoutSaving = function(report,mapData){
		rep.isReportExecuting = true;
		prepareReportToRun(report);
		configureMap(mapData[0]);
//        $rootScope.$broadcast('removeVmsNodes');
		
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
        report.additionalProperties = getUnitSettings();
	    
        //TODO get the report congurations from the backend
        reportRestService.executeWithoutSaving(report).then(getVmsDataSuccess, getVmsDataError);
	};
	
	rep.refreshReport = function(){
	    //TODO extend this to support local changes
	    if (angular.isDefined(rep.id) && rep.tabs.map === true ){
	        $rootScope.$broadcast('removeVmsNodes'); 
	        rep.isReportExecuting = true;
	        var repConfig = getRepConfig();
	        reportRestService.executeReport(rep.id, repConfig).then(updateVmsDataSuccess, updateVmsDataError);
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
            rep.hasWarning = true;
            rep.message = locale.getString('spatial.map_no_positions_for_alarms_data');
            $timeout(function(){
                rep.hasWarning = false;
                rep.message = undefined;
            }, 3000);
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
		configureMap(data);
        var repConfig = getRepConfig();
        
	    reportRestService.executeReport(rep.id,repConfig).then(getVmsDataSuccess, getVmsDataError);

        if (rep.refresh.status === true) {
            rep.setAutoRefresh();
        }
	};
	
	//Get Spatial config Error callback
	var getConfigError = function(error){
	    rep.isReportExecuting = false;
	    rep.hasError = true;
        rep.refresh.status = false;
        rep.message = locale.getString('spatial.map_error_loading_report');
        $timeout(function(){
            rep.hasError = false;
            rep.message = undefined;
        }, 3000);
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
        rep.message = locale.getString('spatial.map_error_loading_report');
        $timeout(function(){
            rep.hasError = false;
            rep.message = undefined;
        }, 3000);
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
            rep.hasWarning = true;
            rep.message = locale.getString('spatial.map_no_alarms_data');
            $timeout(function(){
                rep.hasWarning = false;
                rep.message = undefined;
            }, 3000);
        }
        loadingStatus.isLoading('LiveviewMap', false);
    };
    
    var getAlarmsError = function(error){
        rep.message = locale.getString('spatial.map_error_alarms_data');
        $timeout(function(){
            rep.hasError = false;
        }, 3000);
        loadingStatus.isLoading('LiveviewMap', false);
    };
	
	//Get VMS data Success callback
	var getVmsDataSuccess = function(data){
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
                rep.hasWarning = true;
                rep.message = locale.getString('spatial.map_no_vms_data');
                $timeout(function(){
                    rep.hasWarning = false;
                    rep.message = undefined;
                }, 3000);
            }
        }
        rep.isReportExecuting = false;
    };
    
    //Get VMS data Failure callback
    var getVmsDataError = function(error){
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = true;
        rep.isReportExecuting = false;
        rep.hasError = true;
        rep.message = locale.getString('spatial.map_error_loading_report');
        $timeout(function(){
            rep.hasError = false;
            rep.message = undefined;
        }, 3000);
    };
    
    //Refresh report success callback
    var updateVmsDataSuccess = function(data){
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
            rep.hasWarning = true;
            rep.message = locale.getString('spatial.map_no_vms_data');
            $timeout(function(){
                rep.hasWarning = false;
                rep.message = undefined;
            }, 3000);
        }
        rep.isReportExecuting = false;
    };
    
    //Refresh report failure callback
    var updateVmsDataError = function(error){
        rep.isReportExecuting = false;
        rep.hasError = true;
        rep.message = locale.getString('spatial.map_error_loading_report');
        $timeout(function(){
            rep.hasError = false;
            rep.message = undefined;
        }, 3000);
    };
    
    var prepareReportToRun = function(report){
	    rep.liveviewEnabled = true;
	    rep.id = report.id;
	    rep.name = report.name;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = report.withMap;
    
        //This gets executed on initial loading when we have a default report
        if (!angular.isDefined(mapService.map)){
            mapService.resetLabelContainers();
            mapService.setMap(defaultMapConfigs);
        } else {
            mapService.clearVectorLayers();
            
            //Reset history control
            mapService.getControlsByType('HistoryControl')[0].resetHistory();
            
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
	    //mapService.setAlarmsStylesObj(data.vectorStyles.alarms); FIXME
	    
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
            rep.refresh.status = data.map.refresh.status;
            rep.refresh.rate = data.map.refresh.rate;   
        }
        
        mapService.updateMapSize();
        
	    //Finally load VMS positions and segments
        rep.getReportTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
	};

	return rep;
});