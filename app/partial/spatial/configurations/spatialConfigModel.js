angular.module('unionvmsWeb').factory('SpatialConfig',function() {
    
    function SpatialConfig(){
        this.generalSettings = {
            geoserverURL: undefined
        };
        this.mapSettings = {
            mapProjectionId: undefined,
            displayProjectionId: undefined,
            coordinatesFormat: undefined,
            scaleBarUnits: undefined,
            autoRefreshStatus: false,
            autoRefreshRate: undefined
        };
        this.visibilitySettings = {
            positions: {
                popup: [],
                labels: []
            },
            segments: {
                popup: [],
                labels: []
            }
        };
    }
    
    SpatialConfig.prototype.forReportConfig = function(){
        var srcConfig = new SpatialConfig();
        var finalConfig = {
            mapSettings: {
                mapProjectionId: srcConfig.mapSettings.mapProjectionId,
                displayProjectionId: srcConfig.mapSettings.displayProjectionId,
                coordinatesFormat: srcConfig.mapSettings.coordinatesFormat,
                scaleBarUnits: srcConfig.mapSettings.scaleBarUnits
            }
        };
        
        return finalConfig;
    };
    
    //Used in the report form map configuration modal
    SpatialConfig.prototype.forReportConfigFromJson = function(data){
        var srcConfig = new SpatialConfig();
        var finalConfig = {
            mapSettings: { 
                mapProjectionId: data.mapProjectionId,
                displayProjectionId: data.displayProjectionId,
                coordinatesFormat: data.coordinatesFormat.toLowerCase(),
                scaleBarUnits: data.scaleBarUnits.toLowerCase()
            }
        };
        
        return finalConfig;
    };
    
	return SpatialConfig;
});