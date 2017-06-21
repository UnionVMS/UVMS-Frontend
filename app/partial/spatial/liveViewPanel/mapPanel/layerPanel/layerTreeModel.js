/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').factory('TreeModel',function(locale, mapService, userService) {

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
	
	//Build tree node for Bing based layers
	var buildBingBasedNodes = function(src){
	    if (angular.isDefined(src.apiKey) && src.apiKey !== ''){
	        baseLayerCounter += 1;
	        
	        var layerTitle = locale.getString('spatial.layer_tree_' + src.title);
	        var node = {
	            title: layerTitle,
	            selected: baseLayerCounter === 1 ? true : false,
	            extraClasses: 'layertree-basemap',
	            data: {
	                type: src.type,
	                isBaseLayer: true,
	                title: layerTitle,
	                layerGeoName: src.layerGeoName,
	                apiKey: src.apiKey
	            }
	        };
	        
	        return node;
	    }
	};
	
	//Build a tree node for WMS layers
	var buildWmsNode = function(src){
	    var stylesForObject = [];
	    var selected = false;
	    if (angular.isDefined(src.styles)){
	        stylesForObject = checkWmStylesAvailability(src.styles);
	    }
	    
	    var filtersForObject;
	    //This is for user areas only
	    if (angular.isDefined(src.filters)){
	        filtersForObject = buildCqlContext(src.filters, 'USERAREAS');
        }
	    
	    //This is for system areas and port data
	    if (angular.isDefined(src.groupFilter)){
	        filtersForObject = buildCqlContext(src.groupFilter, 'REFDATA');
	    }
	    
	    if (src.isBaseLayer === true){
	        baseLayerCounter += 1;
	        if (baseLayerCounter === 1){
	            selected = true;
	        }
	    }
	    
	    if (!angular.isDefined(src.cql)){
	        src.cql = null;
	    }
	    
	    //Final node
	    var mapExtent = mapService.map.getView().getProjection().getExtent();
	    var node = {
	        title: src.title,
	        selected: selected,
	        extraClasses: src.isBaseLayer === true ? 'layertree-basemap' : undefined,
	        data: {
	            type: 'WMS',
	            title: src.title,
	            typeName: angular.isDefined(src.typeName) ? src.typeName : undefined, 
	            isBaseLayer: src.isBaseLayer,
	            attribution: src.shortCopyright,
	            longAttribution: angular.isDefined(src.longCopyright) ? src.longCopyright : undefined,
	            url: src.url,
	            serverType: angular.isDefined(src.serverType) ? src.serverType : undefined,
	            params: {
	                time_: (new Date()).getTime(),
	                'LAYERS': src.layerGeoName,
	                'TILED': true,
	                'TILESORIGIN': mapExtent[0] + ',' + mapExtent[1],
	                'STYLES': angular.isDefined(stylesForObject) === true ? stylesForObject[0] : '', 
	                'cql_filter': src.cql
	            }
	        }
	    };
	    
	    if (angular.isDefined(filtersForObject)){
            node.data.contextItems =  filtersForObject;
        }
	    
	    
	    var menuSep = {
	        className: 'context-menu-item context-menu-separator context-menu-not-selectable'
	    };
	    
	    if (stylesForObject.length > 1){
	        if (angular.isDefined(node.data.contextItems)){
	            _.extend(node.data.contextItems, {sep1: menuSep});
	            _.extend(node.data.contextItems, stylesForObject[1]); 
	        } else {
	            node.data.contextItems = stylesForObject[1];
	        }
	    }
	    
	    if ((angular.isDefined(src.areaType) && src.areaType === 'SYSAREA') || (angular.isDefined(src.typeName) && (src.typeName === 'PORT' || src.typeName === 'PORTAREA'))){
	        _.extend(node.data.contextItems, {sep2: menuSep});
	        var settings = {
                settingsMenu: {
                    name: locale.getString('spatial.layer_tree_tip_context_menu'),
                    icon: function(opt, $itemElement, itemKey, item){
                        $itemElement.html('<span class="fa fa-wrench" aria-hidden="true"></span>' + item.name);
                        return 'context-menu-icon-settings';
                    }
                }
            };
            _.extend(node.data.contextItems, settings);
	    }
	    
	    if (angular.isDefined(node.data.contextItems)){
	        node.data.contextTip = locale.getString('spatial.layer_tree_tip_context_menu');
	        _.extend(node.data.contextItems, {sep3: menuSep});
	    }
	    
	    return node;
	};
	
	//Build area nodes
	var buildAreaNode = function(src){
	    var node;
	    if (src.areaType === 'SYSAREA'){
	        if (angular.isDefined(src.cql)){
	            src.groupFilter = {
	                baseCql: src.cql,
	                allCql: null
	            };
	        }
	        node = buildWmsNode(src);
	    } else if (src.areaType === 'AREAGROUP'){
	        node = buildUserAreaGroupNode(src);
	    } else {
	        node = buildUserAreaNode(src);
	    }
	    
	    return node;
	};
	
	//User area group specific node
	var buildUserAreaGroupNode = function(src){
	    var cql = "(user_name = '" + userService.getUserName() + "' OR scopes ilike '%#" + userService.getCurrentContext().scope.scopeName +"#%')";
	    
	    var newDef = {
            isBaseLayer: src.isBaseLayer,
            layerGeoName: src.layerGeoName,
            longCopyright: src.longCopyright,
            shortCopyright: src.shortCopyright,
            serverType: src.serverType,
            styles: src.styles,
            type: src.url,
            url: src.url,
            title: src.title,
            cql: cql + ' AND ' + src.cql_all + ' AND ' +src.cql_active,
            filters: {
                baseCql: cql,
                allCql: src.cql_all,
                activeCql: src.cql_active
            }
        };
        
        return buildWmsNode(newDef);
	};
	
	//User area specific node
	var buildUserAreaNode = function(src){
	    var filter;
	    if (src.areaType === 'USERAREA'){
	        filter = 'gid = ' + src.gid;
	    } else {
	        filter = "user_name = '" + userService.getUserName() + "' AND " + src.cql;
	    }
	    
	    var newDef = {
            isBaseLayer: src.isBaseLayer,
            layerGeoName: src.layerGeoName,
            longCopyright: src.longCopyright,
            shortCopyright: src.shortCopyright,
            serverType: src.serverType,
            styles: src.styles,
            type: src.url,
            url: src.url,
            title: src.title,
            cql: filter 
        };
	    
	    return buildWmsNode(newDef);
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
	
	//Cql options for user area group layers (type is USERAREAS), and for ref data (type is REFDATA)
	var buildCqlContext = function(filters, type){
	    var cqlContext = {
            cqlHeader: {
                name: locale.getString('spatial.layer_tree_context_menu_show_title'),
                disabled: true,
                className: 'layer-menu-header'
            }
        }; 
	    
	    var name_1, name_2, cql_1, cql_2;
	    if (type === 'USERAREAS'){
	        name_1 = locale.getString('spatial.layer_tree_context_menu_active_areas_title');
	        cql_1 = filters.baseCql + ' AND ' + filters.allCql + ' AND ' + filters.activeCql;
	        name_2 = locale.getString('spatial.layer_tree_context_menu_all_areas_title');
	        cql_2 = filters.baseCql + ' AND ' + filters.allCql;
	    } else {
	        name_1 = locale.getString('spatial.layer_tree_context_menu_active_groups_title');
            cql_1 = filters.baseCql;
            name_2 = locale.getString('spatial.layer_tree_context_menu_all_groups_title');
            cql_2 = filters.allCql;
	    }
	    
	    cqlContext.activeAreas = {
            name: name_1,
            type: 'radio',
            radio: 'filter',
            value: 'activeAreas',
            cql: cql_1,
            selected: true
        };
	    
	    cqlContext.allAreas = {
	        name: name_2,
	        type: 'radio',
	        radio: 'filter',
	        value: 'allAreas',
	        cql: cql_2,
	        selected: false
	    };
	
	    return cqlContext;
	};
	
	//Build style contextmenu object
	var buildStyleContext = function(styles, defaultStyle){
	    var styleContext = {
	        styleHeader: {
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
	
	var loopAndBuildNode = function(nodeFromServer){
	    var nodeArray = [];
	    for (var i = 0; i < nodeFromServer.length; i++){
	        var def = nodeFromServer[i];
	        switch(def.type){
                case 'WMS':
                    if (angular.isDefined(def.areaType)){
                        nodeArray.push(buildAreaNode(def));
                    } else {
                        nodeArray.push(buildWmsNode(def));
                    }
                    break;
                case 'OSM':
                    nodeArray.push(buildOsmBasedNodes(def));
                    break;
                case 'OSEA':
                    nodeArray.push(buildOsmBasedNodes(def));
                    break;
                case 'BING':
                    var node = buildBingBasedNodes(def);
                    if (angular.isDefined(node)){
                        nodeArray.push(node);
                    }
                    break;
            }
	    }
	    
	    return nodeArray;
	};
	
	//Check if ports and port areas have been configured with group selection
	var setAdditionalPortSettings = function(data){
	    angular.forEach(data, function(rec) {
	    	if (angular.isDefined(rec.cql)){
	    	    rec.groupFilter = {
                    baseCql: rec.cql,
                    allCql: null
                };
	    	}
	    });
	    
	    return data;
	};
	
	TreeModel.prototype.fromConfig = function(config){
	    var tree = [];

	    //Ports
	    if (angular.isDefined(config.port)){
	        var portNodes = loopAndBuildNode(setAdditionalPortSettings(config.port));
	        tree.push({
              title: locale.getString('spatial.layer_tree_ports'),
              folder: true,
              expanded: false,
              children: portNodes
	        });
	    }
	    
	    //Areas
	    if (angular.isDefined(config.areas) && config.areas.length > 0){
	        var areaNodes = loopAndBuildNode(config.areas);
	        var areaFolder = {
                title: locale.getString('spatial.layer_tree_areas'),
                folder: true,
                expanded: false,
                children: areaNodes
	        };
	        
	        tree.push(areaFolder);
	    }
	    
	    //Additional cartography
	    if (angular.isDefined(config.additional)){
	        var additionalNodes =  loopAndBuildNode(config.additional);
            tree.push({
                title: locale.getString('spatial.layer_tree_additional_cartography'),
                folder: true,
                expanded: false,
                children: additionalNodes
            });
        }
	    
   	    //Baselayers
        if (angular.isDefined(config.baseLayers)){
            var baseNodes = loopAndBuildNode(config.baseLayers);
            tree.push({
                title: locale.getString('spatial.layer_tree_background_layers'),
                folder: true,
                expanded: true,
                unselectable: true,
                hideCheckbox: true,
                extraClasses: 'layertree-baselayer-node',
                key: 'basemap',
                children: baseNodes
            });
        }

	    baseLayerCounter = 0; 
	    return tree;
	};
	
	//Build vector nodes for positions and segments
	var buildVectorNodes = function(type, data){
	    var title, lyrType, longCopyright, extraCls;
	    var selected = false;
	    
	    switch (type) {
            case 'positions':
                title = locale.getString('spatial.layer_tree_positions');
                selected = true;
                lyrType = 'vmspos';
                longCopyright = locale.getString('spatial.vms_positions_long_copyright');
                break;
            case 'segments':
                title = locale.getString('spatial.layer_tree_segments');
                lyrType = 'vmsseg';
                longCopyright = locale.getString('spatial.vms_positions_long_copyright');
                break;
            case 'activities':
                title = locale.getString('spatial.layer_tree_activities');
                lyrType = 'ers';
                longCopyright = locale.getString('spatial.activities_long_copyright');
                extraCls = 'layertree-alarms';
                break;
            default:
                break;
        }
	    
	    var node = {
	        title: title,
	        selected: selected,
	        extraClasses: extraCls,
	        data: {
	            excludeDnd: true,
	            title: title,
	            type: lyrType,
	            isBaseLayer: false,
	            optionsEnabled: true,
	            optionsTip: 'spatial.layer_tree_tip_context_menu',
	            labelEnabled: true,
	            labelTip: 'spatial.layer_tree_tip_label_vector',
	            longAttribution: longCopyright.length > 0 ? longCopyright : undefined,
	            geoJson: data
	        }
	    };
	    
	    //FIXME this should be removed when we implement conmtext menu options and labels for activities layer
	    if (type === 'activities'){
	        node.data.optionsEnabled = false;
	        node.data.labelEnabled = false;
	    }
	    
	    if (type === 'positions'){
	        var sourceArray = _.map(data.features, function(feat){
	            return feat.properties.source;
	        });
	        
	        sourceArray = _.sortBy(_.uniq(sourceArray), function(src){
	            return src;
	        });
	        
	        mapService.vmsSources = {};
	        if (sourceArray.length > 0){
	            var childNodes = [];
	            var sourcesType = [];
	            angular.forEach(sourceArray, function(source){
	                childNodes.push({
	                    title: source,
	                    type: 'vmspos-source',
	                    selected: true
	                });
	                sourcesType.push(source);
	                mapService.vmsSources[source] = true;
	            });
	            
	            node.children = childNodes;
	            node.expanded = false;
	            node.data.sourcesType = sourcesType;
	        }
	    }
	    
	    return node;
	};
	
	//Build parent folder node for vms layers
	TreeModel.prototype.nodeFromData = function(data){
	    var finalNodes = [];
	    var vectorNodes = [];

	    if (data.movements.features.length > 0){
	        vectorNodes.push(buildVectorNodes('positions', data.movements));
	    }
	    if (data.segments.features.length > 0){
	        vectorNodes.push(buildVectorNodes('segments', data.segments));
	    }
	    
	    if (vectorNodes.length > 0){
	        var node = {
                title: locale.getString('spatial.layer_tree_vms'),
                type: 'vmsdata',
                folder: true,
                expanded: true,
                children: vectorNodes
            };
            finalNodes.push(node);
            if (data.activities.features.length > 0){
                finalNodes.push(buildVectorNodes('activities', data.activities));
            }
            
            return finalNodes;
	    }
	};
	
	//Build node for alarms
	TreeModel.prototype.nodeForAlarms = function(data){
	    var longCopyright = locale.getString('spatial.alarms_long_copyright');
	    var title = locale.getString('spatial.layer_tree_alarms'); 
	    var node = {
	        title: title,
	        type: 'alarms',
	        folder: false,
	        selected: true,
	        extraClasses: 'layertree-alarms',
	        data: {
	            excludeDnd: true,
                title: title,
                type: 'alarms',
                optionsEnabled: true,
                optionsTip: 'spatial.layer_tree_tip_context_menu',
                longAttribution: longCopyright.length > 0 ? longCopyright : undefined,
                geoJson: data
	        }
	    };
	    
	    return node;
	};
	
	return TreeModel;
});
