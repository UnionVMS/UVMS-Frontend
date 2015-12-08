angular.module('unionvmsWeb').factory('reportService',function($rootScope, $timeout, TreeModel, reportRestService, spatialRestService, spatialHelperService, mapService) {

    var rep = {
       id: undefined,
       isReportExecuting: false,
       hasError: false,
       tabs: {
           map: true,
           vms: true
       },
       positions: [],
       segments: [],
       tracks: []
    };
    
    rep.clearVmsData = function(){
        rep.id = undefined;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
    };
    
	rep.runReport = function(report){
	    rep.id = report.id;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = report.withMap;
        rep.isReportExecuting = true;
        mapService.clearVmsLayers();
        if (report.withMap === true){
            spatialRestService.getConfigsForReport(report.id).then(getConfigSuccess, getConfigError);
        } else {
            reportRestService.executeReport(rep.id).then(getVmsDataSuccess, getVmsDataError);
        }
	};
	
	//Get Spatial config Success callback
	var getConfigSuccess = function(data){
	    //Change map ol.View configuration
	    if (mapService.getMapProjectionCode !== 'EPSG:' + data.map.projection.epsgCode){
	        mapService.updateMapView(data.map.projection);
	    }
	    
	    //Set map controls
	    mapService.updateMapControls(data.map.control);
	    
	    //Set toolbar controls
	    spatialHelperService.setToolbarControls(data);
	    
	    //Set the styles for vector layers and legend
	    mapService.setPositionStylesObj(data.vectorStyles.positions);
	    mapService.setSegmentStylesObj(data.vectorStyles.segments);
	    
	    //Set popup visibility settings
	    mapService.setPopupVisibility('positions', data.visibilitySettings.positions.popup);
	    mapService.setPopupVisibility('segments', data.visibilitySettings.segments.popup);
	    
	    //TODO set label visibility
	    
	    //Build tree object and update layer panel
	    var treeSource = new TreeModel();
	    treeSource = treeSource.fromConfig(data.map.layers);
	    $rootScope.$broadcast('updateLayerTreeSource', treeSource);
	    
	    //Finally load VMS positions and segments
	    reportRestService.executeReport(rep.id).then(getVmsDataSuccess, getVmsDataError);
	};
	
	//Get Spatial config Error callback
	var getConfigError = function(error){
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
            
            //First clear vector layers
            mapService.clearVectorLayers();
            
            //Add nodes to the tree and layers to the map
            var vectorNodeSource = new TreeModel();
            vectorNodeSource = vectorNodeSource.nodeFromData(data);
            
            $rootScope.$broadcast('addLayerTreeNode', vectorNodeSource);
        }
        rep.isReportExecuting = false;
    };
   
    //Get VMS data Failure callback
    var getVmsDataError = function(error){
        console.log(error);
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = true;
        rep.isReportExecuting = false;
        rep.hasError = true;
        $timeout(function(){rep.hasError = false;}, 3000);
    };

	return rep;
});