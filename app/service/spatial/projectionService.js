/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name projectionService
 * @param locale {service} angular locale service
 * @param $interval {service} angular interval service
 * @param spatialRestService {service} Spatial REST API service
 * @description
 *  A service to fetch and process all supported map projections. Used throughout the application for comboboxes and map specific functions
 */
angular.module('unionvmsWeb').factory('projectionService',function(locale, $interval, spatialRestService) {

	var projectionService = {
	    items: [],
	    coordinatesFormatItems: [],
	    srcProjections: [],
	    isLoading: false,
	    isLoaded: false,
	    /**
	     * Get supported projections while checking if a request is already being done
	     * 
	     * @memberof projectionService
	     * @public
	     */
	    getProjections: function(){
	        if (this.isLoaded === false && this.isLoading === false){
	            this.isLoading = true;
	            this.setProjectionItems(false);
	        }
	    },
	    /**
	     * Get supported projections from Spatial REST API, store them, and build the object to use in comboboxes
	     * 
	     * @memberof projectionService
	     * @public
	     * @param {Boolean} loadCoords - True to process supported coordinate formats for a given projection
	     * @param {Number} [selectedId] - The id of the selected projection so that supported coordinate formats are processed. Should only be used when loadCoords is true.
	     */
	    setProjectionItems: function(loadCoords, selectedId){
	        spatialRestService.getSupportedProjections().then(function(response){
                projectionService.isLoaded = true;
                projectionService.srcProjections = response;
                for (var i = 0; i < projectionService.srcProjections.length; i++){
                    projectionService.items.push({
                        "text": projectionService.srcProjections[i].name,
                        "code": projectionService.srcProjections[i].id
                    });
                    
                    if (loadCoords === true){
                        projectionService.setCoordinatesUnitItems(selectedId);
                    }
                }
				projectionService.isLoading = false;
            }, function(error){
                console.log(error);
				projectionService.isLoading = false;
            });
	    },
	    /**
	     * Clear stored coordinate formats
	     * 
	     *  @memberof projectionService
	     *  @public
	     */
	    clearCoordinatesUnitItems: function(){
	        this.coordinatesFormatItems = [];
	    },
	    /**
	     * Set supported coordinate formats for a specific projection and feed comboboxes.
	     * 
	     * @memberof projectionService
	     * @public
	     * @param {Number} projCode - The projection id as stored internally in the service
	     */
	    setCoordinatesUnitItems: function(projCode){
	        var tempCoords = [];
	        for (var i = 0; i < this.srcProjections.length; i++){
	            if (this.srcProjections[i].id === projCode){
	                var formats = this.srcProjections[i].formats.split(';');
	                for (var j = 0; j < formats.length; j++){
	                    var name = 'spatial.map_configuration_coordinates_format_' + formats[j];
	                    tempCoords.push({"text": locale.getString(name), "code": formats[j]});
	                }
	            }
	        }
	        this.coordinatesFormatItems = tempCoords;
	    },
	    /**
	     * Lazy setting of projections and coordinate formats
	     * 
	     * @memberof projectionService
	     * @public
	     * @param {Number} selectedId - The id of the selected projection so that supported coordinate formats are processed
	     */
	    setLazyProjectionAndCoordinates: function(selectedId){
	        var projObj = this;
	        if (this.isLoaded === false){
	            //loading admin and user preferences
	            if (this.isLoading === false){
	                this.isLoading = true;
	                this.setProjectionItems(true, selectedId);
	            } else {
	                this.intervalPromise = $interval(function(){
	                    if (projObj.items.length > 0 && projObj.isLoaded === true){
	                        projObj.setCoordinatesUnitItems(selectedId);
	                        stopInterval(projObj);
	                    }
	                }, 1);
	            }
	        } else {
	            //loading report configs
                this.intervalPromise = $interval(function(){
                    if (projObj.items.length > 0 && projObj.isLoaded === true){
                        projObj.setCoordinatesUnitItems(selectedId);
                        stopInterval(projObj);
                    }
                }, 1);
	        }
	    },
	    /**
	     * Get local projection id by EPSG code
	     * 
	     * @memberof projectionService
	     * @public
	     * @param {String} epsg - EPSG code (e.g. 'EPSG:4326' or '4326')
	     * @returns {Number|undefined} The local id of the projection or undefined if not found
	     */
	    getProjectionIdByEpsg: function(epsg){
	        var epsgCode = epsg;
	        if (epsg.indexOf(':') !== -1){
	            epsgCode = epsg.split(':')[1];
	        }
	        
	        if (angular.isDefined(this.srcProjections)){
	            for (var i = 0; i < this.srcProjections.length; i++){
	                if (this.srcProjections[i].epsgCode === parseInt(epsgCode)){
	                    return this.srcProjections[i].id; 
	                }
	            }
	        }
	    },
	    /**
	     * Get local projection EPSG code by id
	     * 
	     * @param {Number} id - The local id of the projection
	     * @returns {Number|undefined} The EPSG code (e.g. 4326) or udefined if not found
	     */
	    getProjectionEpsgById: function(id){
	        if (angular.isDefined(this.srcProjections)){
	            for (var i = 0; i < this.srcProjections.length; i++){
	                if (this.srcProjections[i].id === id){
	                    return this.srcProjections[i].epsgCode; 
	                }
	            }
	        }
	    },
	    /**
	     * Get full projection object by EPSG code
	     * 
	     * @memberof projectionService
	     * @public
	     * @param {String} epsg  - EPSG code (e.g. 'EPSG:4326' or '4326')
	     * @returns {Object|undefined} The projection object containing its definitions or undefined if not found
	     */
	    getFullProjByEpsg: function(epsg){
	        var epsgCode = epsg;
            if (epsg.indexOf(':') !== -1){
                epsgCode = epsg.split(':')[1];
            }
            
            if (angular.isDefined(this.srcProjections)){
                for (var i = 0; i < this.srcProjections.length; i++){
                    if (this.srcProjections[i].epsgCode === parseInt(epsgCode)){
                        return this.srcProjections[i]; 
                    }
                }
            }
	    },
	    /**
	     * Get Spherical Mercator projection definition for fallback modes
	     * 
	     * @memberof projectionService
	     * @public
	     * @returns {Object} The object containing the projection properties
	     */
	    getStaticProjMercator: function(){
	        return {
	            axis: 'enu',
	            epsgCode : 3857,
	            extent : '-20026376.39;-20048966.10;20026376.39;20048966.10',
	            formats : 'm',
	            global : true,
	            name : 'Spherical Mercator',
	            units : 'm'
	        };
	    }
	};
	
	var stopInterval = function(obj){
        $interval.cancel(obj.intervalPromise);
        obj.intervalPromise = undefined;
    };

	return projectionService;
});