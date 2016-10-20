/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name tripSummaryService
 * @attr {unionvmsWeb.Trip} trip - The current trip in trip summary
 * @attr {Object} mapConfigs - A property object that will contain the cronology of trips related to the current trip
 * @attr {Array} tripTabs - A property object that will be the catch details
 * @description
 *  Service to manage the trip summary view in the application
 */
angular.module('unionvmsWeb').factory('tripSummaryService',function() {
	var tripSummaryService = {
	    trip: undefined,
	    mapConfigs: undefined,
        tripTabs: undefined
	};
	
    /**
     * Open a new tab with a specific trip
     * 
     * @memberof tripSummaryService
     * @public
     * @param {String} tripId - trip id
	 * @alias openNewTrip
     */
    tripSummaryService.openNewTrip = function(tripId){
        if(!angular.isDefined(this.tripTabs)){
            this.tripTabs = [];
        }
        this.tripTabs.push(tripId);
        this.initializeTrip(this.tripTabs.length-1);
    };

    /**
     * Reset map configs
     * 
     * @memberof tripSummaryService
     * @public
	 * @alias resetMapConfigs
     */
	tripSummaryService.resetMapConfigs = function(){
	    this.mapConfigs = undefined;
	};
	
    /**
     * Build mock data
     * 
     * @memberof tripSummaryService
     * @private
     */
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