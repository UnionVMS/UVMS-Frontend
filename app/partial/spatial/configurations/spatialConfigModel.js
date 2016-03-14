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
            geoserverUrl: undefined,
            bingApiKey: undefined
        };
        this.layerSettings = {
    		additionalLayers: [],
	        areaLayers: [],
	        baseLayers: [],
	        portLayers: []
        		
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
                table: {},
                popup: {},
                labels: {}
            },
            segments: {
                table: {},
                popup: {},
                labels: {}
            },
            tracks: {
                table: {}
            }
        };
        
    }
    
    //Admin level configs
    SpatialConfig.prototype.forAdminConfigFromJson = function(data, ports){
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
        var i = 0;
        if (angular.isDefined(config.positionStyle)){
        	var positionProperties = {};
        	positionProperties.attribute = config.positionStyle.attribute;
        	positionProperties.style = {};
            if(["reportedSpeed","calculatedSpeed","reportedCourse"].indexOf(positionProperties.attribute) !== -1){
    			angular.forEach(config.positionStyle.style, function(item){
    				positionProperties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
    			});
    			positionProperties.style["default"] = config.positionStyle.defaultColor;
            }else if(["activity","type"].indexOf(positionProperties.attribute) !== -1){
				for (i = 0; i < config.positionStyle.style.length; i++){
					positionProperties.style[config.positionStyle.style[i].code] = config.positionStyle.style[i].color;
                }
				positionProperties.style["default"] = config.positionStyle.defaultColor;
    		}else{
	            for (i = 0; i < config.positionStyle.style.length; i++){
	            	positionProperties.style[config.positionStyle.style[i].code] = config.positionStyle.style[i].color;
	            }
    		}
            
            config.stylesSettings.positions = positionProperties;
            srcConfig.stylesSettings.positions = positionProperties;
            config.positionStyle = undefined;
        }
        if(angular.isDefined(config.segmentStyle)){
    		var segmentProperties = {};
    		segmentProperties.attribute = config.segmentStyle.attribute;
    		segmentProperties.style = {};
    		segmentProperties.style.lineStyle = config.segmentStyle.lineStyle;
        	segmentProperties.style.lineWidth = "" + config.segmentStyle.lineWidth;
    		if(["speedOverGround","distance","duration","courseOverGround"].indexOf(segmentProperties.attribute) !== -1){
    			angular.forEach(config.segmentStyle.style, function(item){
    				segmentProperties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
    			});
    			segmentProperties.style["default"] = config.segmentStyle.defaultColor;
    		}else if(["segmentCategory"].indexOf(segmentProperties.attribute) !== -1){
				for (i = 0; i < config.segmentStyle.style.length; i++){
    				segmentProperties.style[config.segmentStyle.style[i].code] = config.segmentStyle.style[i].color;
                }
				segmentProperties.style["default"] = config.segmentStyle.defaultColor;
    		}else{
    			for (i = 0; i < config.segmentStyle.style.length; i++){
    				segmentProperties.style[config.segmentStyle.style[i].code] = config.segmentStyle.style[i].color;
                }
    		}
    		config.stylesSettings.segments = segmentProperties;
    		srcConfig.stylesSettings.segments = segmentProperties;
    		config.segmentStyle = undefined;
		}
        
        if(angular.isDefined(config.visibilitySettings)){
    	    var visibilityTypes = ['position','segment','track'];
    	    var contentTypes = ['Table','Popup','Label'];
    	    
    	    angular.forEach(visibilityTypes, function(visibType) {
    	    	angular.forEach(contentTypes, function(contentType) {
    	    		if(visibType !== 'track' || visibType === 'track' && contentType === 'Table'){
    	    			var visibilityCurrentSettings = config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
    		    		var visibilityCurrentAttrs = config.visibilitySettings[visibType + contentType + 'Attrs'];
    	    			var visibilities = {};
    		    		visibilities.values = [];
    		    		visibilities.order = [];
    		    		visibilities.isAttributeVisible = visibilityCurrentSettings.isAttributeVisible;
    		    		var content;
    		    		
    		    		for(var i = 0; i < visibilityCurrentAttrs.length; i++){
    	    	    		visibilities.order.push(visibilityCurrentAttrs[i].value);
    		    		}
    		    		
    		    		if(angular.isDefined(visibilityCurrentSettings.values)){
	    		    		for(var j = 0; j < visibilities.order.length; j++){
	    	    				if(visibilityCurrentSettings.values.indexOf(visibilities.order[j]) !== -1){
	    	    					visibilities.values.push(visibilities.order[j]);
	    	    				}
	    		    		}
	    		    		angular.copy(visibilities,visibilityCurrentSettings);
    		    		}
    	    		}
    	    		delete config.visibilitySettings[visibType + contentType + 'Attrs'];
    		    });
    	    });
        }
        
        config.layerSettings = checkLayerSettings(config.layerSettings);

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
        
        if (angular.isDefined(data.layerSettings)){
            config.layerSettings = data.layerSettings;
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
            },
            stylesSettings: srcConfig.stylesSettings,
            visibilitySettings: srcConfig.visibilitySettings,
            layerSettings: srcConfig.layerSettings
        };
        
        return finalConfig;
    };
    
    //Used in the report form map configuration modal
    SpatialConfig.prototype.forReportConfigFromJson = function(data){
        var config = {
            mapSettings: {
                spatialConnectId: angular.isDefined(data.mapConfiguration.spatialConnectId) ? data.mapConfiguration.spatialConnectId : undefined,
                mapProjectionId: angular.isDefined(data.mapConfiguration.mapProjectionId) ? data.mapConfiguration.mapProjectionId : undefined,
                displayProjectionId: angular.isDefined(data.mapConfiguration.displayProjectionId) ? data.mapConfiguration.displayProjectionId : undefined,
                coordinatesFormat: angular.isDefined(data.mapConfiguration.coordinatesFormat) ? data.mapConfiguration.coordinatesFormat.toLowerCase() : undefined,
                scaleBarUnits: angular.isDefined(data.mapConfiguration.scaleBarUnits) ? data.mapConfiguration.scaleBarUnits.toLowerCase() : undefined
            },
            stylesSettings: angular.isDefined(data.mapConfiguration.stylesSettings) ? data.mapConfiguration.stylesSettings : this.stylesSettings,
            visibilitySettings: angular.isDefined(data.mapConfiguration.visibilitySettings) ? data.mapConfiguration.visibilitySettings : this.visibilitySettings,
            layerSettings: angular.isDefined(data.mapConfiguration.layerSettings) ? data.mapConfiguration.layerSettings : this.layerSettings
        };
        
        return config;
    };
    
	return SpatialConfig;
});