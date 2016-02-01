var resetLayerFilter = function(opt_options){
    var options = opt_options || {};
    
    var btn = document.createElement('button');
    btn.title = options.label;
    var icon = document.createElement('span');
    icon.className = 'fa fa-refresh';
    icon.style.fontSize = '13px';
    btn.appendChild(icon);
    
    var this_ = this;
    
    var resetFilter = function(e){
        var layers = this_.getMap().getLayers();
        if (layers.getLength() > 1){
            layers = layers.getArray().filter(function(layer){
                return layer.get('type') !== 'osm' && layer.getSource() instanceof ol.source.TileWMS && layer.get('visible') === true;
            });
            
            for (var i = 0; i < layers.length; i++){
                var cql = null;
                var currentPams = layers[i].getSource().getParams();
                var cqlComps = currentPams.cql_filter.split(' and');
                if (cqlComps.length > 1){
                    cql = cqlComps[0];
                    layers[i].getSource().updateParams({
                        'cql_filter': cql,
                        time_: (new Date()).getTime()
                    });
                }
            }
        }
    };
    
    btn.addEventListener('click', resetFilter, false);
    
    var element = document.createElement('div');
    element.className = 'ol-resetCql ol-unselectable ol-control';
    element.appendChild(btn);
    
    ol.control.Control.call(this, {
        element: element,
        target: options.target,
    });
};
    
ol.inherits(resetLayerFilter, ol.control.Control);

angular.module('unionvmsWeb').factory('areaMapService',function(locale, UserArea, userService) {

	var areaMs = {};
	
	areaMs.setMap = function(){
	    var view = new ol.View({
	       projection: 'EPSG:3857',
	       center: ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:3857'),
	       zoom: 3,
	       maxZoom: 19,
	       enableRotation: false
	    });
	    
	    var map = new ol.Map({
	        target: 'areaMap',
	        controls: areaMs.getControls(),
	        interactions: areaMs.getInteractions(),
	        logo: false 
	    });
	    
	    map.setView(view);
	    areaMs.map = map;
	    
	    areaMs.addOSM();
	    areaMs.addVector();
	};
	
	//LAYERS
	areaMs.addOSM =  function(){
	    var layer = new ol.layer.Tile({
	        type: 'osm',
            source: new ol.source.OSM()
        });
	    
	    areaMs.map.addLayer(layer);
	};
	
	//User areas wms
	areaMs.addUserAreasWMS = function(def){
	    var layer = new ol.layer.Tile({
	        type: def.typeName,
	        source: new ol.source.TileWMS({
	            url: def.serviceUrl,
	            serverType: 'geoserver',
	            crossOrigin: 'anonymous',
	            params: {
                    'LAYERS': def.geoName,
                    'TILED': true,
                    'STYLES': def.style,
                    'cql_filter': "user_name = '" + userService.getUserName() + "'"
                }
	        })
	    });
	    
	    areaMs.map.addLayer(layer);
	};
	
	//Add new cql param to wms using gid
	areaMs.mergeParamsGid = function(gid, type, isEqual){
	    var layer = areaMs.getLayerByType(type);
        if (angular.isDefined(layer)){
    	    var layerSrc = layer.getSource();
    	    var currentParams = layerSrc.getParams();
    	    var cqlComps = currentParams.cql_filter.split(' and');
    	    
    	    var cql = cqlComps[0] + ' and ';
    	    if (isEqual === true){
    	        cql += "gid = " + parseInt(gid);
    	    } else {
    	        cql += "gid <> " + parseInt(gid);
    	    }
    	    
    	    
    	    layerSrc.updateParams({
    	        'cql_filter': cql,
    	        time_: (new Date()).getTime()
    	    });
        }
	};
	
	//Clear WMS params
	areaMs.clearParams = function(type){
	    var layer = areaMs.getLayerByType(type);
	    if (angular.isDefined(layer)){
	        var layerSrc = layer.getSource();
	        var currentParams = layerSrc.getParams();
	        var cqlComps = currentParams.cql_filter.split(' and');
	        
	        layerSrc.updateParams({
	            'cql_filter': cqlComps[0],
	            time_: (new Date()).getTime()
	        });
	    }
	};
	
	//Vector drawing layer
	areaMs.addVector = function(){
	    var features = new ol.Collection();
	    var layer = new ol.layer.Vector({
	        type: 'drawlayer',
	        source: new ol.source.Vector({
	            features: features,
	            wrapX: false
	        }),
	        wrapX: false,
	        style: new ol.style.Style({
	            fill: new ol.style.Fill({
	                color: 'rgba(255, 255, 255, 0.2)'
	            }),
	            stroke: new ol.style.Stroke({
	                color: '#F7580D',
	                width: 2
	            })
	        }) 
	    });
	    
	    areaMs.map.addLayer(layer);
	};
	
	areaMs.removeVectorFeatures = function(){
	    var layer = areaMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            layer.getSource().clear();
        }
	};
	
	areaMs.addVectorFeatureFromCoords = function(coords, srcProj, doZoom){
	    var geom = new ol.geom.Polygon();
        geom.setCoordinates([coords]);
        
        if (srcProj !== areaMs.getMapProjectionCode()){
            geom.transform(srcProj, areaMs.getMapProjectionCode());
        }
        
        areaMs.addVectorFeature(geom, doZoom);
	};
	
	areaMs.addVectorFeature = function(geom, doZoom){
	    var feature = new ol.Feature({
            geometry: geom
        });
        
        UserArea.geometry = geom;
        var layer = areaMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            var src = layer.getSource(); 
            src.clear();
            src.addFeature(feature);
        }
            
        if (doZoom){
            areaMs.zoomToGeom(geom);
        }
	};
	
	//CONTROLS AND INTERACTIONS
	areaMs.addDrawControl = function(){
	    var layer = areaMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
    	    var source = layer.getSource(); 
    	    var draw = new ol.interaction.Draw({
    	        source: source,
    	        type: 'Polygon',
    	        condition: ol.events.condition.noModifierKeys,
    	        freehandCondition: ol.events.condition.never
    	    });
    	    
    	    draw.on('drawstart', function(evt){
    	        var features = source.getFeatures();
    	        if (features.length !== 0){
    	            UserArea.geometry = undefined;
    	            source.clear();
    	        }
    	    });
    	    
    	    draw.on('drawend', function(evt){
    	        UserArea.geometry = evt.feature.getGeometry(); 
    	        UserArea.setCoordsFromGeom();
    	        UserArea.coordsProj = areaMs.getMapProjectionCode();
    	    });
    	    
    	    areaMs.map.addInteraction(draw);
        }
	};
	
	areaMs.removeDrawControl = function(){
	    areaMs.map.removeInteraction(areaMs.getInteractionsByType('Draw')[0]);
	};
	
	areaMs.addEditControl = function(){
	    var layer = areaMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
    	    var source = layer.getSource();
    	    var edit = new ol.interaction.Modify({
    	        features: source.getFeaturesCollection(),
    	        deleteCondition: function(event) {
    	            return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
    	        }
    	    });
    	    
    	    edit.on('modifyend', function(evt){
    	        UserArea.geometry = evt.features.item(0).getGeometry();
    	        UserArea.setCoordsFromGeom();
    	        UserArea.coordsProj = areaMs.getMapProjectionCode();
    	    });
    	    
    	    areaMs.map.addInteraction(edit);
        }
	};
	
	areaMs.removeEditControl = function(){
        areaMs.map.removeInteraction(areaMs.getInteractionsByType('Modify')[0]);
    };
	
	//Default controls
	areaMs.getControls = function(){
	    var ctrls = [];
	    
	    ctrls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));
	    
	    ctrls.push(new ol.control.Zoom({
            zoomInTipLabel: locale.getString('areas.map_tip_zoomin'),
            zoomOutTipLabel: locale.getString('areas.map_tip_zoomout')
        }));
	    
	    ctrls.push(new resetLayerFilter({
            label: locale.getString('areas.map_tip_reset_layer_filter')
        }));
	    
	    return new ol.Collection(ctrls);
	};
	
	//Default interactions
	areaMs.getInteractions = function(){
	    var interactions = [];
	    
	    interactions.push(new ol.interaction.MouseWheelZoom());
	    interactions.push(new ol.interaction.KeyboardZoom());
	    interactions.push(new ol.interaction.DoubleClickZoom());
	    interactions.push(new ol.interaction.DragZoom());
	    interactions.push(new ol.interaction.DragPan());
	    interactions.push(new ol.interaction.KeyboardPan());
	    
	    return new ol.Collection(interactions);
	};
	
	//GENERIC FUNCTIONS
	//Refresh WMS layer
	areaMs.refreshWMSLayer = function(type){
	    var layer = areaMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            layer.getSource().updateParams({time_: (new Date()).getTime()});
        }
	};
	
	//Set layer opacity
	areaMs.setLayerOpacity = function(type, value){
	    var layer = areaMs.getLayerByType(type);
	    if (angular.isDefined(layer)){
	        if (!value){
	            value = 1;
	        }
	        layer.setOpacity(value);
	    }
	};
	
	//toggle layer visibility
	areaMs.toggleLayerVisibility = function(type){
	    var layer = areaMs.getLayerByType(type);
	    var currentVis = layer.get('visible');
	    layer.set('visible', !currentVis);
	};
	
	//Update map size
	areaMs.updateMapSize = function(){
	    if (!areaMs.map) {
            return;
        }
	    areaMs.map.updateSize();
	};
	
	//Get layer by type
    areaMs.getLayerByType = function(type){
        var layers = areaMs.map.getLayers().getArray();
        var layer = layers.filter(function(layer){
            return layer.get('type') === type;
        });

        return layer[0];
    };
    
    //Bring layer to the top of the map
    areaMs.raiseLayer = function(type){
        var layer = areaMs.getLayerByType(type);
        var currentIdx = layer.get('currentIdx');
        
        var layers = areaMs.map.getLayers();
        var lyrLength = layers.getLength();
        
        if (!angular.isDefined(currentIdx) && currentIdx !== lyrLength - 1){
            var idx;
            layers.forEach(function(lyr, lyrIdx){
                if (lyr.get('type') === type){
                    idx = lyrIdx;
                }
            });
            
            layers.removeAt(idx);
            layer.set('currentIdx', lyrLength - 1);
            layers.insertAt(lyrLength - 1, layer);
        }
    };
	
	//Get map projection
    areaMs.getMapProjectionCode = function(){
        return areaMs.map.getView().getProjection().getCode();
    };
    
    //Zoom to geom
    areaMs.zoomToGeom = function(geom){
        areaMs.map.getView().fit(geom, areaMs.map.getSize(), {maxZoom:19});
    };
    
	//Get array of interactions by type
    areaMs.getInteractionsByType = function(type){
        var interactions = areaMs.map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[type] === true;
        });
        
        return ints;
    };
	
	return areaMs;
	
});