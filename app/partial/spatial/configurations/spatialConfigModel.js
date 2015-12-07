angular.module('unionvmsWeb').factory('SpatialConfig',function() {
    
    function SpatialConfig(){
        this.systemSettings = {
            geoserverUrl: undefined
        };
        this.mapSettings = {
            mapProjectionId: undefined,
            displayProjectionId: undefined,
            coordinatesFormat: undefined,
            scaleBarUnits: undefined,
            refreshStatus: false,
            refreshRate: undefined
        };
        this.stylesSettings = {
            positions: {
                attribute: undefined,
                style: {}
            },
            segments: {
                attribute: undefined,
                style: {}
            }
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
    
    //Admin level configs
    SpatialConfig.prototype.forAdminConfigFromJson = function(data){
        var config = new SpatialConfig();
        
        config.systemSettings.geoserverUrl = data.systemSettings.geoserverUrl;
        config.mapSettings = {
            mapProjectionId: data.mapSettings.mapProjectionId,
            displayProjectionId: data.mapSettings.displayProjectionId,
            coordinatesFormat: data.mapSettings.coordinatesFormat,
            scaleBarUnits: data.mapSettings.scaleBarUnits,
            refreshStatus: data.mapSettings.refreshStatus,
            refreshRate: data.mapSettings.refreshRate
        };
        config.visibilitySettings = data.visibilitySettings;
        config.stylesSettings = data.stylesSettings;
        
        return config;
    };
    
    //Report level configs
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
        var config = {
            mapSettings: {
                spatialConnectId: angular.isDefined(data.spatialConnectId) ? data.spatialConnectId : undefined,
                mapProjectionId: angular.isDefined(data.mapProjectionId) ? data.mapProjectionId : undefined,
                displayProjectionId: angular.isDefined(data.displayProjectionId) ? data.displayProjectionId : undefined,
                coordinatesFormat: angular.isDefined(data.coordinatesFormat) ? data.coordinatesFormat.toLowerCase() : undefined,
                scaleBarUnits: angular.isDefined(data.scaleBarUnits) ? data.scaleBarUnits.toLowerCase() : undefined
            }
        };
        
        return config;
    };
    
	return SpatialConfig;
});