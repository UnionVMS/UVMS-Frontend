angular.module('unionvmsWeb').factory('tripSummaryService',function() {
	var tripSummaryService = {
	    trip: undefined,
	    mapConfigs: undefined
	};
	
	tripSummaryService.resetMapConfigs = function(){
	    this.mapConfigs = undefined;
	};
	
	//BUILD MOCK DATA
	function buildMock(){
	    var geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [[-9.5, 39],[-7.5, 42.5]]
                    },
                    "properties": {}
                },{
                    "type": "Feature",
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [[-8.5, 38.8],[-8.5, 40.5]]
                    },
                    "properties": {}
                }
            ]
        };
	    
	    tripSummaryService.mapData = angular.fromJson(geojson);
	}
	
	buildMock(); //FIXME to remove
	
	return tripSummaryService;
});