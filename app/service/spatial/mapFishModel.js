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
        
        printMapSize: [],

        GridLayer : function(){

            return {
                type: "grid",
                gridType: "points",
                numberOfLines: [5,5],
                renderAsSvg: true,
                opacity: 1,
                font: {
                    name: ["Sans-serif"],
                    size: 8,
                    style: "BOLD"
                }
            };
        },

        Legend : function(name){
            this.name = name;
            this.classes = [];
        },

        Payload : function(attributes, layout){
            this.layout = layout;
            this.attributes = attributes;
            this.addMap = function(Map) { this.attributes["map"] = Map;};
            this.addLegend = function(Legend) { this.attributes["legend"] = Legend;};
        },

        WmsLayer : function(baseURL, layer) {
            this.baseURL = baseURL;
            this.imageFormat = 'image/png';
            this.customParams = { "TRANSPARENT": "true" };
            this.layers = [layer];
            this.opacity = 1;
            this.serverType = 'geoserver';
            this.type = 'WMS';
            this.addLayer = function(layer) { this.layers.push(layer);};
        },

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

        initLayoutAttributes : function(capabilities, _layout){ // TODO add title, decription from reportservice
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
.factory('MapFishPayload',function(MapFish, mapService){
    function mapFishPayload(){
        this.layout = undefined;
        this.attributes = {};
    }
    
    mapFishPayload.prototype.createPayloadObj = function(data){
        this.layout = MapFish.selected_layout;
        this.attributes = buildAttributes(data);
    };
    
    var buildAttributes = function(data){
        var attr = {};
        
        //Setting attributes defined through the printing widget like title, description, etc
        angular.forEach(data, function(value, key) {
        	attr[key] = value;
        }, attr);
        
        attr.map = buildMapAttributes();
        
        return attr;
    };
    
    var buildMapAttributes = function(){
        var map = {};
        var layerSrc = mapService.getLayerByType('print').getSource();
        
        map.projection = mapService.getMapProjectionCode();
        map.bbox = layerSrc.getExtent();
        map.dpi = MapFish.selected_dpi;
        map.rotation = 0;
        
        map.layers = getLayersConfigArray();
//        this.addLayer = function(layer) { this.layers.push(layer);};
        
        return map;
    };
    
    var getLayersConfigArray = function(){
        var layers = [];
        return layers;
    };
    
    return mapFishPayload;
});
