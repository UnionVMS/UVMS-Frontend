angular.module('unionvmsWeb').factory('areaMapService',function(locale, UserArea) {

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
	    
//	          image: new ol.style.Circle({
//	            radius: 7,
//	            fill: new ol.style.Fill({
//	              color: '#ffcc33'
//	            })
//	          })

	    areaMs.map.addLayer(layer);
	};
	
	areaMs.removeVectorFeatures = function(){
	    var layer = areaMs.getLayerByType('drawlayer');
	    layer.getSource().clear();
	};
	
	areaMs.addVectorFeatureFromCoords = function(coords, srcProj, doZoom){
	    //TODO warp geometry
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
        
        var src = areaMs.getLayerByType('drawlayer').getSource(); 
        src.clear();
        src.addFeature(feature);
        
        if (doZoom){
            areaMs.zoomToGeom(geom);
        }
	};
	
	areaMs.getLayerByType = function(type){
	    var layers = areaMs.map.getLayers().getArray();
        var layer = layers.filter(function(layer){
            return layer.get('type') === type;
        });

        return layer[0];
	};
	
	
	//CONTROLS AND INTERACTIONS
	areaMs.addDrawControl = function(){
	    var source = areaMs.getLayerByType('drawlayer').getSource(); 
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
	};
	
	areaMs.removeDrawControl = function(){
	    areaMs.map.removeInteraction(areaMs.getInteractionsByType('Draw')[0]);
	};
	
	areaMs.addEditControl = function(){
	    var source = areaMs.getLayerByType('drawlayer').getSource();
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
	//Update map size
	areaMs.updateMapSize = function(){
	    if (!areaMs.map) {
            return;
        }
	    areaMs.map.updateSize();
	};
	
	//Get map projection
    areaMs.getMapProjectionCode = function(){
        return areaMs.map.getView().getProjection().getCode();
    };
    
    //Zoom to geom
    areaMs.zoomToGeom= function(geom){
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