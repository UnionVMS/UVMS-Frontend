angular.module('unionvmsWeb').factory('SpatialConfig',function() {
    
    function SpatialConfig(){
        this.mapSettings = {
            mapProjectionId: undefined,
            displayProjectionId: undefined,
            coordinatesFormat: undefined,
            scaleBarUnits: undefined,
            autoRefreshStatus: false,
            autoRefreshRate: undefined
        };            
    }
    
    //TODO remove properties from default object when needed
    
	return SpatialConfig;
});