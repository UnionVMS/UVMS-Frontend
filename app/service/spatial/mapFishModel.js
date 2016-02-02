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

        Map : function(){
            this.projection = "EPSG:3857"; // TODO
            this.rotation = 0;
            this.scale = 99900000; // TODO
            this.center = []; // TODO
            this.dpi = undefined;
            this.layers = [];
            this.addLayer = function(layer) { this.layers.push(layer);};
        },

        Legend : function(name){
            this.name = name;
            this.classes = [];
        },

        Payload : function(layoutAttributes, layout){
            this.layout = layout;
            this.layoutAttributes = layoutAttributes;
            this.addMap = function(Map) { this.layoutAttributes["map"] = Map;};
            this.addLegend = function(Legend) { this.layoutAttributes["legend"] = Legend;};
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
            model.layouts = [];
            model.formats = [];
            model.layoutAttributes = [];
            model.suggestedDpi = [];
            model.selected_format = undefined;
            model.selected_layout = undefined;
            model.selected_dpi = undefined;
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
                        layout.layoutAttributes.filter(function(attribute){
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
                            }
                        });
                    }
                }
            );
        }
    };

    return model;

});