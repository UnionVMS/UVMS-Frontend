/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('MapFish',function() {

    var model = {

        isDeployed : false,

        jobStatusData : {
            done : true,
            status : undefined,
            elapsedTime: undefined,
            waitingTime: undefined,
            downloadURL: undefined
        },

        templateData : undefined,
        capabilitiesData : undefined,

        templates: [],
        selected_template : undefined,

        formats : [],
        selected_format : undefined,

        layouts : [],
        selected_layout : undefined,

        suggestedDpi : [],
        selected_dpi : undefined,

        layoutAttributes : [],

        printJobData : {
            ref: undefined,
            statusURL: undefined,
            downloadURL: undefined
        },

        includeCoordGrid: true,
        projectionId: undefined,
        includeLongCopyright: false,

        printMapSize: [],

        reset: function(){
            model.templates = [];
            model.layouts = [];
            model.formats = [];
            model.layoutAttributes = [];
            model.suggestedDpi = [];
            model.selected_format = undefined;
            model.selected_layout = undefined;
            model.selected_dpi = undefined;
            model.printMapSize = [];
        },

        resetOnLayoutChange: function(){
            model.layoutAttributes = [];
            model.suggestedDpi = [];
            model.selected_dpi = undefined;
            model.printMapSize = [];
        },

        initTemplateCmbx : function(templates){
            model.templateData = templates;
            for (var i = 0; i < templates.length; i++) {
                model.templates.push({"text": model.templateData[i], "code": model.templateData[i]});
            }
            model.selected_template = model.templates[0].code;
        },

        initLayoutCmbx : function(capabilities){
            model.capabilitiesData = capabilities;
            for (var l = 0; l < model.capabilitiesData.layouts.length; l++) {
                var layout = model.capabilitiesData.layouts[l];
                model.layouts.push({"text": layout.name, "code": layout.name });
            }
            model.selected_layout = model.layouts[0].code;
        },

        initFormatsCmbx : function(capabilities){
            model.capabilitiesData = capabilities;
            for (var f = 0; f < model.capabilitiesData.formats.length; f++) {
                if (model.capabilitiesData.formats[f] !== 'bmp'){
                    model.formats.push({"text": model.capabilitiesData.formats[f], "code": model.capabilitiesData.formats[f]});
                }
            }
            model.selected_format = model.formats[0].code;
        },

        initLayoutAttributes : function(capabilities, _layout){
            model.layoutAttributes = [];
            capabilities.layouts.filter(
                function(layout){
                    if (layout.name === _layout){
                        layout.attributes.filter(function(attribute){
                            if (attribute.type === 'String' && ((attribute.default !== undefined && attribute.default.length < 1) || attribute.default === undefined)){
                                model.layoutAttributes.push(attribute);
                            }
                            else if (attribute.type === 'MapAttributeValues'){
                                model.suggestedDpi = [];
                                for (var d = 0; d < attribute.clientInfo.dpiSuggestions.length; d++){
                                    var dpiValue = attribute.clientInfo.dpiSuggestions[d];
                                    model.suggestedDpi.push({"text": dpiValue, "code": dpiValue});
                                    model.selected_dpi = model.suggestedDpi[0].code;
                                }
                                model.printMapSize = [attribute.clientInfo.width, attribute.clientInfo.height];
                            }
                        });
                    }
                }
            );
        }
    };

    return model;

})
.factory('MapFishPayload',function(locale, $location, Color, MapFish, mapService, mapFishPrintRestService, unitConversionService, projectionService, coordinateFormatService){
    function mapFishPayload(){
        this.layout = undefined;
        this.attributes = {};
    }

    mapFishPayload.prototype.createPayloadObj = function(data, iconLeg){
        this.layout = MapFish.selected_layout;
        this.attributes = buildAttributes(data, iconLeg);
    };


    mapFishPayload.prototype.getIconPayload = function(type){
        var forbidenKeys = ['lineStyle', 'default', 'lineWidth'];
        var styles = mapService.styles[type];

        if (angular.isDefined(styles)){
            var obj, i, keys;
            var classes = [];
            if (type === 'alarms'){
                obj = {
                    title: locale.getString('spatial.styles_attr_status')
                };

                keys = _.keys(styles);
                for (i = 0; i < keys.length; i++){
                    if (keys[i] !== 'size'){
                        classes.push({
                            text: locale.getString('spatial.legend_panel_alarms_' + keys[i]),
                            color: styles[keys[i]]
                        });
                    }
                }
            } else {
                obj = {
                    title: getSubtitle(styles)
                };

                if (type === 'segments'){
                    switch (styles.style.lineStyle) {
                        case 'dotted':
                            obj.lineStyle = '1,1';
                            break;
                        case 'dashed':
                            obj.lineStyle = '5,5';
                            break;
                        case 'dotdashed':
                            obj.lineStyle = '5,2,1,2';
                            break;
                        default:
                            obj.lineStyle = '0,0';
                            break;
                    }
                } else {
                    obj.cluster = {
                        text: locale.getString('spatial.print_cluster_legend_title'),
                        bgcolor: '#FFFFFF',
                        bordercolor: '#F7580D'
                    };
                }

                switch (styles.attribute) {
                    case 'countryCode':
                        for (i = 0; i < styles.displayedCodes.length; i++){
                            classes.push({
                                text: styles.displayedCodes[i],
                                color: styles.style[styles.displayedCodes[i]]
                            });
                        }
                        break;
                    case 'activity': //Positions
                    case 'type':
                    case 'segmentCategory': //Segments
                        keys = _.keys(styles.style);
                        for (i = 0; i < keys.length; i++){
                            if (_.indexOf(forbidenKeys, keys[i]) === -1){
                                classes.push({
                                    text: keys[i],
                                    color: styles.style[keys[i]]
                                });
                            }
                        }

                        //Finally add the default rule
                        classes.push({
                            text: locale.getString('spatial.legend_panel_all_other_values'),
                            color:  styles.style.default
                        });

                        break;
                    case 'reportedCourse': //Positions
                    case 'calculatedSpeed':
                    case 'reportedSpeed':
                    case 'speedOverGround':  //Segments
                    case 'distance':
                    case 'courseOverGround':
                        for (i = 0; i < styles.breaks.intervals.length; i++){
                            classes.push({
                                text: styles.breaks.intervals[i][0] + ' - ' + styles.breaks.intervals[i][1],
                                color: styles.style[styles.breaks.intervals[i][0] + '-' + styles.breaks.intervals[i][1]]
                            });
                        }

                        //Finally add the default rule
                        classes.push({
                            text: locale.getString('spatial.legend_panel_all_other_values'),
                            color:  styles.style.default
                        });

                        break;
                }
            }

            obj.classes = classes;
            return obj;
        }
    };

    var getSubtitle = function(srcDef){
        var withSpeed = ['reportedSpeed', 'calculatedSpeed', 'speedOverGround'];
        var withCourse = ['reportedCourse', 'courseOverGround'];

        var subTitle = locale.getString('spatial.styles_attr_' + srcDef.attribute);
        if (_.indexOf(withSpeed, srcDef.attribute) !== -1){
            var srcUnit = unitConversionService.speed.getUnit();
            subTitle += ' (' + locale.getString('common.speed_unit_' + srcUnit) + ')';
        }

        if (_.indexOf(withCourse, srcDef.attribute) !== -1){
            subTitle += ' (' + String.fromCharCode(parseInt('00B0', 16)) + ')';
        }

        if (srcDef.attribute === 'distance'){
            subTitle += ' (' + unitConversionService.distance.getUnit() + ')';
        }

        return subTitle;
    };

    var buildAttributes = function(data, iconLeg){
        var attr = {};

        //Setting attributes defined through the printing widget like title, description, etc
        angular.forEach(data, function(value, key) {
        	attr[key] = value;
        }, attr);

        var spatialAttr = buildMapAndLegendAttributes(iconLeg);
        attr.map = spatialAttr.map;
        attr.legend = spatialAttr.legend;
        attr.datasource = [];

        attr.copyrightTitle = locale.getString('spatial.print_copyright_title').toUpperCase();
        attr.legendTitle = locale.getString('spatial.print_legend_title').toUpperCase();

        if (spatialAttr.copyright.length > 0){
            attr.datasource.push({
                displayName: '',
                table: {
                    columns: ['layer', 'copyright'],
                    data: spatialAttr.copyright
                }
            });
        }

        return attr;
    };

    var buildMapAndLegendAttributes = function(iconLeg){
        var map = {};
        var legend = {
            name: '',
            classes: []
        };

        var layerSrc = mapService.getLayerByType('print').getSource();

        map.projection = mapService.getMapProjectionCode();
        map.bbox = layerSrc.getExtent();
        map.dpi = MapFish.selected_dpi;
        map.rotation = 0;

        var configs = getLayersAndLegendConfigsArray(iconLeg);
        map.layers = configs.layers;
        legend.classes = configs.legend;

        var finalObj = {
            map: map,
            legend: legend,
            copyright: configs.copyright
        };

        return finalObj;
    };

    var getUrl = function(){
        var url = $location.protocol() + '://' + $location.host();
        if ($location.port() !== 80){
            url += ':' + $location.port();
        }

        return url;
    };

    var legendFuncs = {
        buildWMS: function(layer){
            var src = layer.getSource();
            var params = src.getParams();
            var url = src.getUrls()[0] + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=25&HEIGHT=25&LAYER=';
            url += params.LAYERS;

            if (angular.isDefined(params.STYLES) && params.STYLES !== ''){
                url += '&STYLE=';
                url += params.STYLES;
            }

            var name = layer.get('title');

            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                icons: [url]
            };
        },
        buildVMSPOS: function(layer, iconLeg){
            return this.buildVectorLegend(layer, iconLeg, 'vmspos');
        },
        buildVMSSEG: function(layer, iconLeg){
            return this.buildVectorLegend(layer, iconLeg, 'vmsseg');
        },
        buildALARMS: function(layer, iconLeg){
            return this.buildVectorLegend(layer, iconLeg, 'alarms');
        },
        buildVectorLegend: function(layer, iconLeg, type){
            var url = getUrl();
            url += iconLeg.legend.base;

            switch (type) {
                case 'vmspos':
                    url += iconLeg.legend.positions;
                    break;
                case 'vmsseg':
                    url += iconLeg.legend.segments;
                    break;
                case 'alarms':
                    url += iconLeg.legend.alarms;
                    break;
                default:
                    break;
            }

            var name = layer.get('title');

            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                icons: [url]
            };
        }
    };

    var styleFuncs = {
        buildVMSPOSCluster: function(features){
            var style = {
                version: 2,
                strokeColor: '#F7580D',
                strokeWidth: 2,
                fillColor: '#ffffff',
                fillOpacity: 0.3,
                fontWeight: 'BOLD',
                fontColor: '#000000',
                fontSize: 8,
                fontFamily: 'Arial',
                labelAlign: 'cm',
                labelXOffset: -1,
                labelYOffset: -1
            };

            var name;
            angular.forEach(features, function(feature) {
                var radius = feature.get('radius');

                name = "[";
                name +="radius = " + feature.get('radius');
                name += "]";

                style[name] = {
                    symbolizers: [{
                        type: 'point',
                        pointRadius: radius
                    },{
                        type: 'text',
                        label: '[printLabel]'
                    }]
                };
            });

            return style;
        },
        buildVMSPOS: function(features, iconLeg){
            var styleDef = mapService.styles.positions;

            var style = {
                version: 2,
                graphicWidth: 18,
                graphicOpacity : 1.0,
                graphicFormat : 'image/png',
                type: 'point'
            };

            this.buildVectorStyle(style, styleDef, 'vmspos', iconLeg);

            return style;
        },
        buildALARMS: function(layer){
            var styleDef = mapService.styles.alarms;

            var style = {
                version: 2,
                strokeColor: '#FFFFFF',
                strokeWidth: 2,
                pointRadius: styleDef.size * 2,
                type: 'point',
            };

            this.buildAlarmsStyle(style, styleDef, 'alarms');

            return style;
        },
        buildVMSSEG: function(layer){
            var styleDef = mapService.styles.segments;

            var style = {
                version: 2,
                strokeWidth: angular.isDefined(styleDef.style.lineWidth) ? parseInt(styleDef.style.lineWidth) : 2,
                strokeDashstyle: 'solid',
                strokeLinecap: 'round',
                type: 'line'
            };

            var interval, dot;
            if (angular.isDefined(styleDef.style.lineStyle)){
                switch (styleDef.style.lineStyle) {
                case 'dotted':
                    dot = (style.strokeWidth + 1).toString();
                    interval = style.strokeWidth.toString();
                    style.strokeDashstyle = dot + ' ' + interval;
                    break;
                case 'dashed':
                    style.strokeDashstyle = 'longdash';
                    break;
                case 'dotdashed':
                    var dash = (4 * style.strokeWidth).toString();
                    dot = (style.strokeWidth + 1).toString();
                    interval = (2 * style.strokeWidth).toString();
                    style.strokeDashstyle =  dash + ' ' + interval + ' ' + dot + ' ' + interval;
                    break;
                default:
                    style.strokeDashstyle = 'solid';
                    break;
                }
            }

            this.buildVectorStyle(style, styleDef, 'vmsseg');


            return style;
        },
        buildAlarmsStyle: function(style, styleDef){
            var keys = _.keys(styleDef);

            for (var i = 0; i < keys.length; i++){
                if (keys[i] !== 'size'){
                    var name = "[ticketStatus = '" + keys[i].toUpperCase() + "']";
                    style[name] = {
                        symbolizers: [{
                            fillColor: styleDef[keys[i]],
                            fillOpacity: 1.0,
                        }]
                    };
                }
            }

        },
        buildVectorStyle: function(style, styleDef, type, iconLeg){
            var keys = _.keys(styleDef.style);

            var url;
            if (type === 'vmspos'){
                url = getUrl();
                url += iconLeg.map.vmspos.base;
            }

            var i, name, defaultName, color, tempName;
            switch (styleDef.attribute) {
                case 'activity': //Positions
                case 'type':
                case 'segmentCategory': //Segments
                    var forbidenKeys = ['lineStyle', 'default', 'lineWidth'];
                    for (i = 0; i < keys.length; i++){
                        tempName = styleDef.attribute;
                        if (styleDef.attribute === 'activity'){
                            tempName = 'activityType';
                        } else if (styleDef.attribute === 'type'){
                            tempName = 'movementType';
                        }

                        if (_.indexOf(forbidenKeys, keys[i]) === -1){
                            name = "[";
                            name += tempName + " = '" + keys[i];
                            name += "']";

                            if (type === 'vmsseg'){
                                style[name] = {
                                    symbolizers: [{
                                        strokeWidth: style.strokeWidth + 3,
                                        strokeColor: '#ffffff'
                                    },{
                                        strokeColor: styleDef.style[keys[i]]
                                    }]
                                };
                            } else {
                                color = styleDef.style[keys[i]].slice(1);
                                if (_.indexOf(iconLeg.map.vmspos.colors, color) !== -1){
                                    style[name] = {
                                        symbolizers: [{
                                            rotation: '[reportedCourse]',
                                            externalGraphic: url + color
                                        }]
                                    };
                                }
                            }

                        }
                    }
                    //Finally we build the defaults rule
                    defaultName = "[";
                    defaultName += tempName + " not in ('";
                    defaultName += keys.join("','");
                    defaultName += "')]";

                    if (type === 'vmsseg'){
                        style[defaultName] = {
                            symbolizers: [{
                                strokeWidth: style.strokeWidth + 3,
                                strokeColor: '#ffffff'
                            },{
                                strokeColor: styleDef.style.default
                            }]
                        };
                    } else {
                        color = styleDef.style.default.slice(1);
                        style[defaultName] = {
                            symbolizers: [{
                                rotation: '[reportedCourse]',
                                externalGraphic: url + color
                            }]
                        };
                    }

                    break;
                case 'countryCode':
                    for (i = 0; i < keys.length; i++){
                        if (styleDef.displayedCodes.indexOf(keys[i]) !== -1){
                            name = "[";
                            name += styleDef.attribute + " = '" + keys[i];
                            name += "']";
                            if (type === 'vmsseg'){
                                style[name] = {
                                    symbolizers: [{
                                        strokeWidth: style.strokeWidth + 3,
                                        strokeColor: '#ffffff'
                                    },{
                                        strokeColor: styleDef.style[keys[i]]
                                    }]
                                };
                            } else {
                                color = styleDef.style[keys[i]].slice(1);
                                if (_.indexOf(iconLeg.map.vmspos.colors, color) !== -1){
                                    style[name] = {
                                        symbolizers: [{
                                            rotation: '[reportedCourse]',
                                            externalGraphic: url + color
                                        }]
                                    };
                                }
                            }
                        }
                    }
                    break;
                case 'reportedCourse': //Positions
                case 'calculatedSpeed':
                case 'reportedSpeed':
                case 'speedOverGround':  //Segments
                case 'distance':
                case 'courseOverGround':
                    var min, max;
                    for (i = 0; i < styleDef.breaks.intervals.length; i++){
                        name = "[";
                        name += styleDef.attribute + " >= " + styleDef.breaks.intervals[i][0];
                        name += " and ";
                        name += styleDef.attribute + " < " + styleDef.breaks.intervals[i][1];
                        name += "]";

                        if (type === 'vmsseg'){
                            style[name] = {
                                symbolizers: [{
                                    strokeWidth: style.strokeWidth + 3,
                                    strokeColor: '#ffffff'
                                },{
                                    strokeColor: styleDef.style[styleDef.breaks.intervals[i][0] + '-' + styleDef.breaks.intervals[i][1]]
                                }]
                            };
                        } else {
                            color = styleDef.style[styleDef.breaks.intervals[i][0] + '-' + styleDef.breaks.intervals[i][1]].slice(1);
                            if (_.indexOf(iconLeg.map.vmspos.colors, color) !== -1){
                                style[name] = {
                                    symbolizers: [{
                                        rotation: '[reportedCourse]',
                                        externalGraphic: url + color
                                    }]
                                };
                            }
                        }


                        if (i === 0){
                            min = styleDef.breaks.intervals[i][0];
                            max = styleDef.breaks.intervals[i][1];
                        } else {
                            min = Math.min(min, styleDef.breaks.intervals[i][0]);
                            max = Math.max(max, styleDef.breaks.intervals[i][1]);
                        }
                    }
                    //Finally we build the defaults rule
                    defaultName = "[";
                    defaultName += styleDef.attribute + " < " + min;
                    defaultName += " or ";
                    defaultName += styleDef.attribute + " >= " + max;
                    defaultName += "]";

                    if (type === 'vmsseg'){
                        style[defaultName] = {
                            symbolizers: [{
                                strokeWidth: style.strokeWidth + 3,
                                strokeColor: '#ffffff'
                            },{
                                strokeColor: styleDef.breaks.defaultColor
                            }]
                        };
                    } else {
                        color = styleDef.style.default.slice(1);
                        style[defaultName] = {
                            symbolizers: [{
                                rotation: '[reportedCourse]',
                                externalGraphic: url + color
                            }]
                        };
                    }
                    break;
            }
        }
    };

    var rgbToHex = function(colorStr){
        var pattern = /\d+/g;
        var rgb = colorStr.match(pattern);

        return '#' + ((1 << 24) | (parseInt(rgb[0], 10) << 16) | (parseInt(rgb[1], 10) << 8) | parseInt(rgb[2], 10)).toString(16).substr(1);
    };

    var layerFuncs = {
        buildOSEA: function(layer){
            return this.buildOSM(layer);
        },
        buildOSM: function(layer){
            var prop = layer.getProperties();

            var url;
            if (prop.type === 'OSM'){
                url = 'http://tile.openstreetmap.org';
            } else {
                url = 'http://tiles.openseamap.org/seamark';
            }

            var obj = {
                baseURL: url,
                type: 'OSM',
                resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
                opacity: prop.opacity,
                maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                tileSize: [256, 256],
                imageExtension: 'png'
            };

            return obj;
        },
        buildWMS: function(layer){
            var prop = layer.getProperties();
            var src = layer.getSource();
            var params = src.getParams();

            var obj = {
                baseURL: src.getUrls()[0],
                customParams: {
                    EXCEPTIONS: 'INIMAGE',
                    TRANSPARENT: true,
                    CQL_FILTER: angular.isDefined(params.cql_filter) && params.cql_filter !== null ? params.cql_filter : undefined
                },
                layers: [params.LAYERS],
                opacity: prop.opacity,
                type: 'WMS'
            };

            var server = layer.get('serverType');
            if (angular.isDefined(server)){
                obj.serverType = server;
            }

            if (angular.isDefined(params.STYLES) && params.STYLES !== ''){
                obj.styles = [params.STYLES];
            }

            if (angular.isDefined(params.FORMAT) && params.FORMAT !== ''){
                obj.imageFormat = params.FORMAT;
            } else {
                obj.imageFormat = 'image/png';
            }

            return obj;
        },
        buildALARMS: function(layer){
            var obj = {
                type: 'geojson',
                style: styleFuncs.buildALARMS(layer),
                geojson: getGeoJSON(layer)
            };

            return obj;
        },
        buildVMSSEG: function(layer){
            var obj = {
                type: 'geojson',
                style: styleFuncs.buildVMSSEG(layer),
                geojson: getGeoJSON(layer)
            };

            if (mapService.vmssegLabels.active){
                var dataFields = [];
                var fields = mapService.labelVisibility.segments;
                var mappings = mapService.getMappingTitlesProperties('vmsseg');
                var titles = mapService.getSegmentTitles();

                if (fields.length > 0){
                    angular.forEach(fields, function(item) {
                        var def = {
                            displayName: titles[item],
                            propName: mappings[item]
                        };

                        if (!_.isEqual(def, {})){
                            dataFields.push(def);
                        }
                    });

                    var labelEl = $('.vector-label-vmsseg').first();
                    obj.popupProperties = {
                        showAttrNames: mapService.labelVisibility.segmentsTitles,
                        dataFields: dataFields,
                        popupStyle: {
                            width: parseInt(labelEl.css('width')),
                            radius: parseInt(labelEl.css('border-radius')),
                            border: {
                                color: rgbToHex(labelEl.css('border-left-color')),
                                width: parseInt(labelEl.css('border-left-width'))
                            }
                        }
                    };
                }
            }

            return obj;
        },
        buildVMSPOS: function(layer, iconLeg){
            var format = new ol.format.GeoJSON();
            var printLayerSrc = mapService.getLayerByType('print').getSource();
            var src = layer.getSource();
            var srcStyle = layer.getStyle();

            var features = src.getFeaturesInExtent(printLayerSrc.getExtent());
            var clusters = [];
            var singleFeatures = [];
            var tempSizes = {};
            angular.forEach(features, function(clusterFeat) {
            	var featuresInCluster = clusterFeat.get('features');

            	if (featuresInCluster.length > 1){
            	    var clusterToPrint = new ol.Feature({
            	        geometry: clusterFeat.getGeometry()
            	    });

            	    var number = clusterFeat.get('featNumber');
            	    var radius = clusterFeat.get('radius');

            	    if (!angular.isDefined(radius)){
            	        var featStyle = srcStyle(clusterFeat)[0];
            	        radius = featStyle.getImage().getRadius();
            	    }

            	    clusterToPrint.set('printLabel', clusterFeat.get('featNumber'));
            	    clusterToPrint.set('radius', radius);

            	    clusters.push(clusterToPrint);
            	} else {
            	    var feature = angular.copy(featuresInCluster[0]);
            	    if (mapService.vmsposLabels.active){
            	        if (feature.get('overlayHidden') === false){
            	            var overCoords = mapService.vmsposLabels[feature.get('overlayId')].overlay.getPosition();
                            feature.set('popupX', overCoords[0]);
                            feature.set('popupY', overCoords[1]);

                            var srcCoords = feature.getGeometry().getCoordinates();
                            var proj = mapService.getMapProjectionCode();
            	            if (proj !== 'EPSG:4326'){
                                srcCoords = ol.proj.toLonLat(srcCoords, proj);
                            }

            	            feature.set('disp_lon', coordinateFormatService.formatAccordingToUserSettings(srcCoords[0]));
            	            feature.set('disp_lat', coordinateFormatService.formatAccordingToUserSettings(srcCoords[1]));
            	            feature.set('positionTime', unitConversionService.date.convertToUserFormat(feature.get('positionTime')));
            	            feature.set('reportedSpeed', unitConversionService.speed.formatSpeed(feature.get('reportedSpeed'), 5));
            	            feature.set('calculatedSpeed', unitConversionService.speed.formatSpeed(feature.get('calculatedSpeed'), 5));
            	        }
            	    }
            	    singleFeatures.push(feature);
            	}
            });

            var output = {};
            if (singleFeatures.length > 0){
                output.singleFeatures = {
                    type: 'geojson',
                    style: styleFuncs.buildVMSPOS(singleFeatures, iconLeg),
                    geojson: format.writeFeaturesObject(singleFeatures)
                };

                if (mapService.vmsposLabels.active){
                    var dataFields = [];
                    var fields = mapService.labelVisibility.positions;
                    var mappings = mapService.getMappingTitlesProperties('vmspos');
                    var titles = mapService.getPositionTitles();

                    if (fields.length > 0){
                        angular.forEach(fields, function(item) {
                            var def = {
                                displayName: titles[item]
                            };

                            if (item === 'lon'){
                                def.propName = 'disp_lon';
                            } else if (item === 'lat'){
                                def.propName = 'disp_lat';
                            } else {
                                def.propName = mappings[item];
                            }

                            if (!_.isEqual(def, {})){
                                dataFields.push(def);
                            }
                        });

                        var labelEl = $('.vector-label-vmspos').first();
                        output.singleFeatures.popupProperties = {
                            showAttrNames: mapService.labelVisibility.positionsTitles,
                            dataFields: dataFields,
                            popupStyle: {
                                width: parseInt(labelEl.css('width')),
                                radius: parseInt(labelEl.css('border-radius')),
                                border: {
                                    color: rgbToHex(labelEl.css('border-left-color')),
                                    width: parseInt(labelEl.css('border-left-width'))
                                }
                            }
                        };
                    }
                }
            }

            if (clusters.length > 0){
                output.clusters = {
                    type: 'geojson',
                    style: styleFuncs.buildVMSPOSCluster(clusters),
                    geojson: format.writeFeaturesObject(clusters)
                };
            }

            return output;
        },
        buildGrid: function(){
            var proj = projectionService.getProjectionEpsgById(MapFish.projectionId);
            var obj = {
                type: 'grid',
                gridType: 'points',
                numberOfLines: [5,5],
                opacity: 1,
                renderAsSvg: true,
                labelProjection: angular.isDefined(proj) ? 'EPSG:' + proj : 'EPSG:4326',
                labelFomat: '%1.2f%s',
                font: {
                    name: ['Arial'],
                    size: 8,
                    style: 'BOLD'
                },
                labelColor: "#000000",
                gridColor: "#000000",
                haloRadius: 3
            };

            return obj;
        }
    };

    var getGeoJSON = function(layer){
        var format = new ol.format.GeoJSON();
        var printLayerSrc = mapService.getLayerByType('print').getSource();
        var src = layer.getSource();

        var features = angular.copy(src.getFeaturesInExtent(printLayerSrc.getExtent()));
        if (layer.get('type') === 'vmsseg' && mapService.vmssegLabels.active){
            angular.forEach(features, function(feature) {
            	if (feature.get('overlayHidden') === false){
            	    feature.set('distance', unitConversionService.distance.formatDistance(feature.get('distance'), 5));
            	    feature.set('duration', unitConversionService.duration.timeToHuman(feature.get('duration')));
            	    feature.set('speedOverGround', unitConversionService.speed.formatSpeed(feature.get('speedOverGround'), 5));

            	    var overCoords = mapService.vmssegLabels[feature.get('overlayId')].overlay.getPosition();
            	    feature.set('popupX', overCoords[0]);
            	    feature.set('popupY', overCoords[1]);
            	}
            });
        }
        var geojson = format.writeFeaturesObject(features);

        return geojson;
    };

    var getAttribution = function(layer){
        var attribution = layer.getSource().getAttributions();

        var attrArray = [];
        if (attribution !== null && attribution.length > 0){
            var title = layer.get('title');
            attrArray.push(title.charAt(0).toUpperCase() + title.slice(1));

            var text = '';
            for (var i = 0; i < attribution.length; i++){
                text += $('<p>').html(attribution[i].getHTML()).text();
                if (i < attribution.length - 1){
                    text += ' | ';
                }
            }
            if (MapFish.includeLongCopyright === true){
                if (text.length > 0){
                    text += ' | ';
                }
                text += layer.get('longAttribution');
            }
            attrArray.push(text);
        }

        return attrArray;
    };

    var getLayersAndLegendConfigsArray = function(iconLeg){
        var layers = [];
        var legClasses = [];
        var copyright = [];
        var mapLayers = mapService.map.getLayers();

        mapLayers.forEach(function(lyr, idx, lyrs){
            var type = lyr.get('type');
            var supportedTypes = ['OSM', 'vmspos', 'vmsseg', 'alarms', 'WMS', 'OSEA'];
            var supportedLegTypes = ['WMS', 'vmspos', 'vmsseg', 'alarms'];
            if (angular.isDefined(type) && _.indexOf(supportedTypes, type) !== -1 && lyr.get('visible') === true){
                var fn = 'build' + type.toUpperCase();
                var layerObj;
                if (type === 'vmspos'){
                    layerObj = layerFuncs[fn](lyr, iconLeg);
                } else {
                    layerObj = layerFuncs[fn](lyr);
                }

                var legObj;
                if (_.indexOf(supportedLegTypes, type) !== -1 && (type === 'vmspos' || type === 'vmsseg' || type === 'alarms')){
                    legObj = legendFuncs[fn](lyr, iconLeg);
                } else if (_.indexOf(supportedLegTypes, type) !== -1){
                    legObj = legendFuncs[fn](lyr);
                }

                if (angular.isDefined(layerObj)){
                    if (type === 'vmspos'){
                        if (angular.isDefined(layerObj.clusters) && layerObj.clusters.geojson.features.length > 0){
                            layers.push(layerObj.clusters);
                        }
                        if (angular.isDefined(layerObj.singleFeatures) && layerObj.singleFeatures.geojson.features.length > 0){
                            layers.push(layerObj.singleFeatures);
                        }
                    } else if(type === 'vmsseg'){
                        if (layerObj.geojson.features.length > 0){
                            layers.push(layerObj);
                        }
                    } else {
                        layers.push(layerObj);
                    }
                }

                if (angular.isDefined(legObj)){
                    legClasses.push(legObj);
                }

                //copyright stuff
                var copyArray = getAttribution(lyr);
                if (angular.isDefined(copyArray) && copyArray.length > 0){
                    copyright.push(copyArray);
                }
            }
        });

        if (MapFish.includeCoordGrid === true){
            layers.push(layerFuncs.buildGrid());
        }
        layers.reverse();
        legClasses.reverse();
        copyright.reverse();

        return {
            layers: layers,
            legend: legClasses,
            copyright: copyright
        };
    };

    return mapFishPayload;
});