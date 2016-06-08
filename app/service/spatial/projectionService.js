angular.module('unionvmsWeb').factory('projectionService',function(locale, $interval, spatialRestService) {

	var projectionService = {
	    items: [],
	    coordinatesFormatItems: [],
	    srcProjections: [],
	    isLoading: false,
	    isLoaded: false,
	    getProjections: function(){
	        if (this.isLoaded === false && this.isLoading === false){
	            this.isLoading = true;
	            this.setProjectionItems(false);
	        }
	    },
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
	    clearCoordinatesUnitItems: function(){
	        this.coordinatesFormatItems = [];
	    },
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
	    getProjectionEpsgById: function(id){
	        if (angular.isDefined(this.srcProjections)){
	            for (var i = 0; i < this.srcProjections.length; i++){
	                if (this.srcProjections[i].id === id){
	                    return this.srcProjections[i].epsgCode; 
	                }
	            }
	        }
	    }
	};
	
	var stopInterval = function(obj){
        $interval.cancel(obj.intervalPromise);
        obj.intervalPromise = undefined;
    };

	return projectionService;
});