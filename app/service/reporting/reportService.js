angular.module('unionvmsWeb').factory('reportService',function($rootScope, $timeout, TreeModel, reportRestService, spatialRestService, mapService) {

    var rep = {
       id: undefined,
       isReportExecuting: false,
       hasError: false,
       tabs: {
           map: true,
           vms: true
       }
    };
    
	rep.runReport = function(report){
	    rep.id = report.id;
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        rep.tabs.map = report.withMap;
        rep.isReportExecuting = true;
        if (report.withMap === true){
            spatialRestService.getConfigsForReport(report.id).then(getConfigSuccess, getConfigError);
        } else {
            reportRestService.executeReport(rep.id).then(getVmsDataSuccess, getVmsDataError);
        }
	};
	
	//Get Spatial config Success callback
	var getConfigSuccess = function(data){
	    //TODO change map ol.View configurations
	    
	    //Set the styles for vector layers and legend
	    mapService.setFlagStateStyles(data.vectorStyles.flagState);
	    mapService.setSpeedStyles(data.vectorStyles.speed);
	    
	    //Build tree object and update layer panel
	    var treeSource = new TreeModel();
	    treeSource = treeSource.fromConfig(data.map.layers);
	    $rootScope.$broadcast('updateLayerTreeSource', treeSource);
	    
	    //Finally load VMS positions and segments
	    reportRestService.executeReport(rep.id).then(getVmsDataSuccess, getVmsDataError);
	};
	
	//Get Spatial config Error callback
	var getConfigError = function(error){
	    //TODO warn the user
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
        //TODO warn the user
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