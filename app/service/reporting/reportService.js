angular.module('unionvmsWeb').factory('reportService',function(reportRestService, mapService) {

    var rep = {};
    
    rep.tabs = {
        map: true,
        vms: true
    };
	
	rep.runReport = function(report){
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
        //FIXME to change when ready
	    reportRestService.getVmsData(report.id).then(getVmsDataSuccess, getVmsDataError);
	};
	
	//Get VMS data Success callback
	var getVmsDataSuccess = function(data){
	    //FIXME Config display
	    rep.tabs.map = true;
        rep.tabs.vms = true;
        
        
        rep.positions = data.movements.features;
        rep.segments = data.segments.features;
        rep.tracks = data.tracks;
       
        //Setting up the map
        mapService.clearMap();
        mapService.addFeatureOverlay();
        mapService.addSegments(data.segments);
        mapService.addPositions(data.movements);
    };
   
    //Get VMS data Failure callback
    var getVmsDataError = function(error){
        //TODO warn the user
        console.log(error);
        rep.positions = [];
        rep.segments = [];
        rep.tracks = [];
    };

	return rep;
});