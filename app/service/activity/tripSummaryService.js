/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name tripSummaryService
 * @attr {unionvmsWeb.Trip} trip - The current trip in trip summary
 * @attr {Object} mapConfigs - A property object that will contain the cronology of trips related to the current trip
 * @attr {Array} tabs - A property object that will be the catch details
 * @description
 *  Service to manage the trip summary view in the application
 */
angular.module('unionvmsWeb').factory('tripSummaryService',function($timeout) {
	var tripSummaryService = {
	    trip: undefined,
	    mapConfigs: undefined,
        tabs: undefined
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
        if(!angular.isDefined(this.tabs)){
            this.tabs = [];
        }
        if(_.where(this.tabs, {title: tripId}).length === 0){
            angular.forEach(this.tabs, function(item) {
                item.active = false;
            });

            this.tabs.push({title: tripId, active: true});
            this.initializeTrip(this.tabs.length-1);
        }
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