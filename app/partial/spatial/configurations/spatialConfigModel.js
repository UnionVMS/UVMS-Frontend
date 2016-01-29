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
                table: [],
                popup: [],
                labels: []
            },
            segments: {
                table: [],
                popup: [],
                labels: []
            },
            tracks: {
                table: []
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
    		    		var visibilities = {};
    		    		visibilities.values = [];
    		    		visibilities.order = [];
    		    		var content;
    		    		for(var i = 0; i < config.visibilitySettings[visibType + contentType + 'Attrs'].length; i++){
    	    	    		visibilities.order.push(config.visibilitySettings[visibType + contentType + 'Attrs'][i].value);
    		    		}
    		    		angular.copy(config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()].values,visibilities.values);
    		    		angular.copy(visibilities,config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()]);
    	    		}
    	    		delete config.visibilitySettings[visibType + contentType + 'Attrs'];
    		    });
    	    });
        }

        if(angular.isDefined(config.layerSettings)){
	        var layerData = {};
			if(angular.isDefined(config.layerSettings.portLayers) && !_.isEmpty(config.layerSettings.portLayers)){
	    		var ports = [];
	    		angular.forEach(config.layerSettings.portLayers, function(item) {
	    			var port = {'serviceLayerId': item.serviceLayerId};
		    		ports.push(port);
		    	});
	    		config.layerSettings.portLayers = [];
	    		angular.copy(ports,config.layerSettings.portLayers);
	    	}else{
	    		config.layerSettings.portLayers = undefined;
	    	}
    	
	    	if(angular.isDefined(config.layerSettings.areaLayers)){
	    		
	    		if(angular.isDefined(config.layerSettings.areaLayers.sysAreas) && !_.isEmpty(config.layerSettings.areaLayers.sysAreas)){
		    		var sysareas = [];
		    		angular.forEach(config.layerSettings.areaLayers.sysAreas, function(item) {
		    			var area = {'serviceLayerId': item.serviceLayerId};
		    			sysareas.push(area);
			    	});
		    		config.layerSettings.areaLayers.sysAreas = [];
		    		angular.copy(sysareas,config.layerSettings.areaLayers.sysAreas);
	    		}else{
	    			config.layerSettings.areaLayers.sysAreas = undefined;
	    		}
	    	}
	    	config.layerSettings.areaLayers.userAreas = undefined;
	    	
	    	if(angular.isDefined(config.layerSettings.additionalLayers) && !_.isEmpty(config.layerSettings.additionalLayers)){
	    		var additionals = [];
	    		angular.forEach(config.layerSettings.additionalLayers, function(item) {
	    			var additional = {'serviceLayerId': item.serviceLayerId};
	    			additionals.push(additional);
		    	});
	    		config.layerSettings.additionalLayers = [];
	    		angular.copy(additionals,config.layerSettings.additionalLayers);
	    	}else{
    			config.layerSettings.additionalLayers = undefined;
    		}
	    	
	    	if(angular.isDefined(config.layerSettings.baseLayers) && !_.isEmpty(config.layerSettings.baseLayers)){
	    		var bases = [];
	    		angular.forEach(config.layerSettings.baseLayers, function(item) {
	    			var base = {'serviceLayerId': item.serviceLayerId};
	    			bases.push(base);
		    	});
	    		config.layerSettings.baseLayers = [];
	    		angular.copy(bases,config.layerSettings.baseLayers);
	    	}else{
    			config.layerSettings.baseLayers = undefined;
    		}
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