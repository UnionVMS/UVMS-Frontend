angular.module('unionvmsWeb').factory('TreeModel',function(locale) {

	function TreeModel(){}
	
	var baseLayerCounter = 0;
	
	//Build tree node for OSM based layers
	var buildOsmBasedNodes = function(src){
	    if (src.isBaseLayer === true){
	        baseLayerCounter += 1;
	    }
	    
	    var node = {
	        title: src.title,
	        selected: src.isBaseLayer === false ? undefined : (baseLayerCounter === 1 ? true : false),
	        extraClasses: src.isBaseLayer === true ? 'layertree-basemap' : undefined,
	        data: {
	            type: src.type,
	            isBaseLayer: src.isBaseLayer,
	            title: src.title
	        }
	    };
	    
	    return node;
	};
	
	//Build a tree node for WMS layers
	var buildWmsNode = function(src){
	    var stylesForObject;
	    if (angular.isDefined(src.styles)){
	        stylesForObject = checkWmStylesAvailability(src.styles);
	    }
	    
	    var node = {
	        title: src.title,
	        extraClasses: src.isBaseLayer === true ? 'layertree-basemap' : undefined,
	        data: {
	            type: 'WMS',
	            title: src.title,
	            isBaseLayer: src.isBaseLayer,
	            attribution: src.attribution,
	            url: src.url,
	            serverType: src.serverType,
	            params: {
	                'LAYERS': src.layerGeoName,
	                'TILED': true,
	                'STYLES': angular.isDefined(stylesForObject) === true ? stylesForObject[0] : '' 
	            }
	        }
	    };
	    
	    if (stylesForObject.length > 1){
	        node.data.contextTip = locale.getString('spatial.layer_tree_tip_context_menu');
	        node.data.contextItems = stylesForObject[1]; 
	    }
	    
	    return node;
	};
	
	
	//Check how many WMS styles are available, set the default style and build the style context menu
	var checkWmStylesAvailability = function(styles){
	    var finalStyles = [];
	    var styleKeys = Object.keys(styles);
	    var defaultStyle = styles[styleKeys[0]];
	    
	    finalStyles.push(defaultStyle);
	    if (styleKeys.length > 1){
	        var contextMenuItems = buildStyleContext(styles, defaultStyle);
	        finalStyles.push(contextMenuItems);
	    }
	    
	    return finalStyles;
	};
	
	//Build style contextmenu object
	var buildStyleContext = function(styles, defaultStyle){
	    var styleContext = {
	        header: {
	            name: locale.getString('spatial.layer_tree_context_menu_style_title'),
	            disabled: true,
	            className: 'layer-menu-header'
	        }
	    };
	    
	    if (angular.isDefined(styles.geom)){
	        styleContext.geomStyle = {
	            name: locale.getString('spatial.layer_tree_context_menu_geom_style'),
                type: 'radio',
                radio: 'style',
                value: styles.geom,
                selected: styles.geom === defaultStyle ? true : false
	        };
	    }
	    
	    if (angular.isDefined(styles.labelGeom)){
	        styleContext.geomLabelStyle = {
                name: locale.getString('spatial.layer_tree_context_menu_geom_label_style'),
                type: 'radio',
                radio: 'style',
                value: styles.labelGeom,
                selected: styles.labelGeom === defaultStyle ? true : false
            };
	    }
	    
	    if (angular.isDefined(styles.label)){
	        styleContext.labelStyle = {
                name: locale.getString('spatial.layer_tree_context_menu_label_style'),
                type: 'radio',
                radio: 'style',
                value: styles.label,
                selected: styles.label === defaultStyle ? true : false
            };
	    }
	    
	    return styleContext;
	};
	
	TreeModel.prototype.fromConfig = function(config){
	    var tree = [];
	    
	    var areaNodes = [];
	    var userAreaNodes = [];
	    var baseLayerNodes = [];
	    var additionalNodes = [];
	    for (var i = 0; i < config.length; i++){
	        var def = config[i];
	        switch(def.type){
	            case 'WMS':
	                if (def.layerType === 'area' && def.isBaseLayer === false){
	                    var node = buildWmsNode(def);
	                    areaNodes.push(node);
	                } else if (def.isBaseLayer === true){
	                    baseLayerNodes.push(buildWmsNode(def));
	                }
	                break;
	            case 'OSM':
	                baseLayerNodes.push(buildOsmBasedNodes(def));
	                break;
	            case 'OSEA':
	                additionalNodes.push(buildOsmBasedNodes(def));
	                break;
	        }
	    }
	    
	    //Building area nodes
	    if (areaNodes.length > 0 || userAreaNodes.length > 0){
	        var areaFolder = {
                title: locale.getString('spatial.layer_tree_areas'),
                folder: true,
                expanded: true,
                children: []
            };
	        
	        if (areaNodes.length > 0){
	            areaFolder.children.push({
	                title: locale.getString('spatial.layer_tree_system_areas'),
	                folder: true,
	                children: areaNodes
	            });
	        }
	        
	        //TODO user defined areas
	        tree.push(areaFolder);
	    }
	    
	    //Building additional cartography nodes
	    if (additionalNodes.length > 0){
	        tree.push({
	            title: locale.getString('spatial.layer_tree_additional_cartography'),
	            folder: true,
	            expanded: true,
	            children: additionalNodes
	        });
	    }
	    
	    //Building baselayer nodes
	    if (baseLayerNodes.length > 0){
	        tree.push({
	            title: locale.getString('spatial.layer_tree_background_layers'),
                folder: true,
                expanded: true,
                unselectable: true,
                hideCheckbox: true,
                extraClasses: 'layertree-baselayer-node',
                key: 'basemap',
                children: baseLayerNodes
	        });
	    }
	    
	    baseLayerCounter = 0; 
	    return tree;
	};
	
	//Build vector nodes for positions and segments
	var buildVectorNodes = function(type, data){
	    var node = {
	        title: type === 'positions' ? locale.getString('spatial.layer_tree_positions') : locale.getString('spatial.layer_tree_segments'),
	        selected: true,
	        data: {
	            excludeDnd: true,
	            title: type,
	            type: type === 'positions' ? 'vmspos' : 'vmsseg',
	            popupEnabled: true,
	            popupTip: 'spatial.layer_tree_tip_popup',
	            geoJson: data
	        }
	    };
	    
	    return node;
	};
	
	//Build parent folder node for vms layers
	TreeModel.prototype.nodeFromData = function(data){
	    var vectorNodes = [];
	    vectorNodes.push(buildVectorNodes('positions', data.movements));
	    vectorNodes.push(buildVectorNodes('segments', data.segments));
	    var node = {
	        title: locale.getString('spatial.layer_tree_vms'),
	        folder: true,
	        expanded: true,
	        children: vectorNodes
	    };
	    
	    return node;
	};
	
	return TreeModel;
});