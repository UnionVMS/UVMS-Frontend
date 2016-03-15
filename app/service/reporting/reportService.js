angular.module('unionvmsWeb').factory('reportService',function($rootScope, $timeout, locale, TreeModel, reportRestService, spatialRestService, spatialHelperService, mapService, unitConversionService, vmsVisibilityService) {

    var rep = {
       id: undefined,
       name: undefined,
       isReportExecuting: false,
       hasError: false,
       hasWarning: false,
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
       isLiveViewActive: false,
       outOfDate: undefined
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
        
        //Clear data used in tables
        rep.clearVmsData();
        
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
	    rep.id = report.id;
	    rep.name = report.name;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = report.withMap;
        rep.isReportExecuting = true;
        
        mapService.clearVectorLayers();
        
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

        if (report.withMap === true){
            spatialRestService.getConfigsForReport(report.id).then(getConfigSuccess, getConfigError);
        } else {
            spatialRestService.getConfigsForReportWithoutMap().then(getConfigWithouMapSuccess, getConfigWithouMapError); 
        }
	};
	
	rep.runReportWithoutSaving = function(report){
        rep.tabs.map = report.withMap;
		rep.isReportExecuting = true;
        mapService.clearVectorLayers();
        $rootScope.$broadcast('removeVmsNodes');
        //TODO get the report congurations from the backend 
        reportRestService.executeWithoutSaving(report).then(getVmsDataSuccess, getVmsDataError);
	};
	
	rep.refreshReport = function(){
	    if (angular.isDefined(rep.id) && rep.tabs.map === true ){
	        $rootScope.$broadcast('removeVmsNodes'); 
	        rep.isReportExecuting = true;
	        var repConfig = getUnitSettings();
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
	
	var getUnitSettings = function(){
	    return {
	        speedUnit: unitConversionService.speed.getUnit(),
	        distanceUnit: unitConversionService.distance.getUnit()
	    };
	};
	
	//Get Spatial config Success callback
	var getConfigSuccess = function(data){
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
	    $rootScope.$broadcast('updateLayerTreeSource', treeSource);
	    
        //map refresh configs
        if (rep.tabs.map === true && angular.isDefined(data.map.refresh)){
            rep.refresh.status = data.map.refresh.status;
            rep.refresh.rate = data.map.refresh.rate;   
        }

	    //Finally load VMS positions and segments
	    var repConfig = getUnitSettings();
	    reportRestService.executeReport(rep.id, repConfig).then(getVmsDataSuccess, getVmsDataError);

        if (rep.refresh.status === true) {
            rep.setAutoRefresh();
        }
	};
	
	//Get Spatial config Error callback
	var getConfigError = function(error){
	    rep.isReportExecuting = false;
	    rep.hasError = true;
        rep.refresh.status = false;
        $timeout(function(){rep.hasError = false;}, 3000);
	};
	
	//Get config without map Success callback
    var getConfigWithouMapSuccess = function(data){
        //Set vms table attribute visibility
        vmsVisibilityService.setVisibility(data.visibilitySettings);
        
        var repConfig = getUnitSettings();
        reportRestService.executeReport(rep.id, repConfig).then(getVmsDataSuccess, getVmsDataError);
    };
    
    //Get config without map Success callback
    var getConfigWithouMapError = function(error){
        rep.isReportExecuting = false;
        rep.hasError = true;
        $timeout(function(){rep.hasError = false;}, 3000);
    };
	
	//Get VMS data Success callback
	var getVmsDataSuccess = function(data){
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
        
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
                $timeout(function(){rep.hasWarning = false;}, 3000);
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
        $timeout(function(){rep.hasError = false;}, 3000);
    };
    
    //Refresh report success callback
    var updateVmsDataSuccess = function(data){
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
        
        //Add nodes to the tree and layers to the map
        if (rep.positions.length > 0 || rep.segments.length > 0){
            var vectorNodeSource = new TreeModel();
            vectorNodeSource = vectorNodeSource.nodeFromData(data);
            $rootScope.$broadcast('addLayerTreeNode', vectorNodeSource);
        } else if (rep.positions.length === 0 && rep.segments.length === 0){
            rep.hasWarning = true;
            $timeout(function(){rep.hasWarning = false;}, 3000);
        }
        rep.isReportExecuting = false;
    };
    
    //Refresh report failure callback
    var updateVmsDataError = function(error){
        rep.isReportExecuting = false;
        rep.hasError = true;
        $timeout(function(){rep.hasError = false;}, 3000);
    };

	return rep;
});