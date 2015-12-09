angular.module('unionvmsWeb').factory('SpatialConfig',function() {
    
    function SpatialConfig(){
        this.toolSettings = {
            control: [],
            tbControl: []
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
        this.systemSettings = {
            geoserverUrl: undefined
        };
        this.layerSettings = {
            overlayLayers: [],
            baseLayers: []
        };
        this.mapSettings = {
            mapProjectionId: undefined,
            displayProjectionId: undefined,
            coordinatesFormat: undefined,
            scaleBarUnits: undefined,
            refreshStatus: false,
            refreshRate: undefined
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
        
        config.systemSettings = data.systemSettings;
        config.mapSettings = data.mapSettings;
        config.visibilitySettings = data.visibilitySettings;
        config.stylesSettings = data.stylesSettings;
        config.toolSettings = data.toolSettings;
        config.layerSettings = data.layerSettings;
        
        return config;
    };
    
    SpatialConfig.prototype.forAdminConfigToJson = function(srcConfig){
        var config = {};
        angular.copy(srcConfig, config);
        if (angular.isDefined(config.posFsStyle)){
            var style = {};
            for (var i = 0; i < config.posFsStyle.length; i++){
                style[config.posFsStyle[i].code] = config.posFsStyle[i].color;
            }
            
            config.stylesSettings.positions.style = style;
            srcConfig.stylesSettings.positions.style = style;
            config.posFsStyle = undefined;
        }
        if(angular.isDefined(config.segmentStyle)){
    		var segmentProperties = {};
    		segmentProperties.attribute = config.segmentStyle.attribute;
    		segmentProperties.style = {};
    		
    		if(segmentProperties.attribute === "speedOverGround"){
    			angular.forEach(config.segmentStyle.style, function(item){
    				segmentProperties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
    			});
    			
    			segmentProperties.style["default"] = config.segmentStyle.defaultColor;
    		}
    		config.stylesSettings.segments = segmentProperties;
    		srcConfig.stylesSettings.segments = segmentProperties;
    		config.segmentStyle = undefined;
		}

        return angular.toJson(config);  
    };
    
    //User level configs
    SpatialConfig.prototype.forUserPrefFromJson = function(data){
        var config = new SpatialConfig();
        config.toolSettings = undefined;
        config.systemSettings = undefined;
        config.layerSettings = undefined;
        
        if (angular.isDefined(data.stylesSettings)){
            config.stylesSettings = data.stylesSettings;
        }
        
        if (angular.isDefined(data.mapSettings)){
            config.mapSettings = data.mapSettings;
        }
        
        if (angular.isDefined(data.visibilitySettings)){
            config.visibilitySettings = data.visibilitySettings;
        }
        
        return config;
    };
    
    SpatialConfig.prototype.forUserPrefToServer = function(){
        var config = new SpatialConfig();
        config.toolSettings = undefined;
        config.systemSettings = undefined;
        config.layerSettings = undefined;
        
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