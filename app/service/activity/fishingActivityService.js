/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name fishingActivityService
 * @param Departure {Model} The model for Departure fissing activities <p>{@link unionvmsWeb.Departure}</p>
 * @attr {Object} activityData - An object containing the activity data that will be used in the different views
 * @description
 *  A service to deal with any kind of fishing activity operation (e.g. Departure, Arrival, ...)
 */
angular.module('unionvmsWeb').factory('fishingActivityService',function(Departure) {

	var faServ = {
        activityData: {}
	};
	
	/**
	 * Get fishing activity operation data from server
	 * 
	 * @memberof fishingActivityService
	 * @public
	 * @alias getData
	 * @param {String} type - The activity type (e.g. departure)
	 * @param {String} params - The params to be used to get the data from server
	 */
	faServ.getData = function(type, params){
	    var uType = type.toUpperCase(); 
	    switch (uType) {
            case 'DEPARTURE':
                getDeparture(params);
                break;
            //TODO other types of fa operations
        }
	};
	
	/**
	 * Get data specifically for departure operations
	 * 
	 * @memberof fishingActivityService
	 * @private
	 * @param {Object} params - The params to be used to get the data from server
	 */
	function getDeparture(params){
	    //TODO call rest service when ready
	    faServ.activityData = new Departure();
	    faServ.activityData.fromJson(params);
	}

	return faServ;
});