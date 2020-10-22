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
            },
            alarms: {
                size: undefined,
                open: undefined,
                closed: undefined,
                pending: undefined,
                none: undefined
            }
        };
        this.systemSettings = {
            geoserverUrl: undefined,
            bingApiKey: undefined,
            spatialServerUrl: undefined
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
        this.referenceDataSettings = {};
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
        config.referenceDataSettings = data.referenceDataSettings;

        return config;
    };

    SpatialConfig.prototype.forAdminConfigToJson = function(form){
        var config = new SpatialConfig();

        config = checkSystemSettings(this,config);
        config = checkMapSettings(this,'admin',config,form.mapSettingsForm.$dirty);
        config = checkStylesSettings(this,'admin',config,form.stylesSettingsForm.$dirty);
        config = checkVisibilitySettings(this,'admin',config,form.visibilitySettingsForm.$dirty);
        config = checkLayerSettings(this,'admin',config,form.layerSettingsForm.$dirty);
        config = checkReferenceDataSettings(this,'admin',config,form.referenceDataSettingsForm.$dirty);
        config.toolSettings = this.toolSettings;

        return angular.toJson(config);
    };

    //User level configs
    SpatialConfig.prototype.forUserPrefFromJson = function(data){
        var config = new SpatialConfig();
        config.toolSettings = undefined;
        config.systemSettings = undefined;

        if (angular.isDefined(data.mapSettings)){
            config.mapSettings = data.mapSettings;
        }

        if (angular.isDefined(data.stylesSettings)){
            config.stylesSettings = data.stylesSettings;
        }

        if (angular.isDefined(data.visibilitySettings)){
            config.visibilitySettings = data.visibilitySettings;
        }

        if (angular.isDefined(data.layerSettings)){
            config.layerSettings = data.layerSettings;
        }

        if (angular.isDefined(data.referenceDataSettings)){
            config.referenceDataSettings = data.referenceDataSettings;
        }

        return config;
    };

    SpatialConfig.prototype.forUserPrefToServer = function(form){
        var config = new SpatialConfig();
        config.toolSettings = undefined;
        config.systemSettings = undefined;

        config = checkMapSettings(this,'user',config,form.mapSettingsForm.$dirty);
        config = checkStylesSettings(this,'user',config,form.stylesSettingsForm.$dirty);
        config = checkVisibilitySettings(this,'user',config,form.visibilitySettingsForm.$dirty);
        config = checkLayerSettings(this,'user',config,form.layerSettingsForm.$dirty);
        config = checkReferenceDataSettings(this,'user',config,form.referenceDataSettingsForm.$dirty);

        return angular.toJson(config);
    };

    //Report level configs
    SpatialConfig.prototype.forReportConfig = function(form,userConfig){
        var config = {};
        var formStatus = {
            mapSettingsForm: angular.isDefined(form.mapSettingsForm) ? form.mapSettingsForm.$dirty : false,
            stylesSettingsForm: angular.isDefined(form.stylesSettingsForm) ? form.stylesSettingsForm.$dirty : false,
            visibilitySettings: angular.isDefined(form.visibilitySettings) ? form.visibilitySettings.$dirty : false,
            layerSettingsForm: angular.isDefined(form.layerSettingsForm) ? form.layerSettingsForm.$dirty : false,
            referenceDataSettingsForm: angular.isDefined(form.referenceDataSettingsForm) ? form.referenceDataSettingsForm.$dirty : false
        };

        if(userConfig.mapSettings.spatialConnectId !== this.mapSettings.spatialConnectId || userConfig.mapSettings.mapProjectionId !== this.mapSettings.mapProjectionId ||
        userConfig.mapSettings.displayProjectionId !== this.mapSettings.displayProjectionId || userConfig.mapSettings.coordinatesFormat !== this.mapSettings.coordinatesFormat ||
        userConfig.mapSettings.scaleBarUnits !== this.mapSettings.scaleBarUnits || formStatus.mapSettingsForm){
            config = checkMapSettings(this,'report',config,formStatus.mapSettingsForm);
        }else{
            config.mapSettings = {};
        }

        if(!angular.equals(userConfig.stylesSettings,this.stylesSettings) || formStatus.stylesSettingsForm){
            config.mapSettings = checkStylesSettings(this,'report',config.mapSettings,formStatus.stylesSettingsForm);
        }

        if(!angular.equals(userConfig.visibilitySettings.positions,this.visibilitySettings.positions) ||
        !angular.equals(userConfig.visibilitySettings.segments,this.visibilitySettings.segments) ||
        !angular.equals(userConfig.visibilitySettings.tracks,this.visibilitySettings.tracks) ||
        formStatus.visibilitySettingsForm){
            config.mapSettings = checkVisibilitySettings(this,'report',config.mapSettings,formStatus.visibilitySettingsForm);
        }

        removeLayerHashKeys(this.layerSettings);
        fixIndividualUserAreas(userConfig.layerSettings);
        fixIndividualUserAreas(this.layerSettings);
        if((!angular.equals(userConfig.layerSettings,this.layerSettings) || formStatus.layerSettingsForm) && !this.layerSettings.reseted){
            config.mapSettings = checkLayerSettings(this,'report',config.mapSettings,formStatus.layerSettingsForm);
        }

        if(!angular.equals(userConfig.referenceDataSettings,this.referenceDataSettings) || formStatus.referenceDataSettingsForm){
            config.mapSettings = checkReferenceDataSettings(this,'report',config.mapSettings,formStatus.referenceDataSettingsForm);
        }

        return config;
    };

    //Used in the report form map configuration modal
    SpatialConfig.prototype.forReportConfigFromJson = function(data){
        var config = new SpatialConfig();
        config.toolSettings = undefined;
        config.systemSettings = undefined;

        if (angular.isDefined(data)){
            config.mapSettings = {};
            config.mapSettings.spatialConnectId = data.spatialConnectId;
            config.mapSettings.mapProjectionId = data.mapProjectionId;
            config.mapSettings.displayProjectionId = data.displayProjectionId;
            config.mapSettings.coordinatesFormat = data.coordinatesFormat;
            config.mapSettings.scaleBarUnits = data.scaleBarUnits;

            if (angular.isDefined(data.stylesSettings)){
                config.stylesSettings = data.stylesSettings;
            }

            if (angular.isDefined(data.visibilitySettings)){
                config.visibilitySettings = data.visibilitySettings;
            }

            if (angular.isDefined(data.layerSettings)){
                config.layerSettings = data.layerSettings;
            }

            if (angular.isDefined(data.referenceDataSettings)){
                config.referenceDataSettings = data.referenceDataSettings;
            }
        }

        return config;
    };

    var checkSystemSettings = function(model,config){
        //Validate geoserver URL
        if (angular.isDefined(model.systemSettings.geoserverUrl)){
            var lastLetter = model.systemSettings.geoserverUrl.substr(model.systemSettings.geoserverUrl.length - 1);
            if (lastLetter !== '/'){
                model.systemSettings.geoserverUrl += '/';
            }
        }
        config.systemSettings = model.systemSettings;
        return config;
    };

    var checkMapSettings = function(model,settingsLevel,config,changed){
        if(!changed && model.mapSettings && model.mapSettings.reseted){
            config.mapSettings = undefined;
        }else if(changed && model.mapSettings){
            config.mapSettings = {};
            if(settingsLevel !== 'report'){
                config.mapSettings.refreshStatus = model.mapSettings.refreshStatus;
                config.mapSettings.refreshRate = model.mapSettings.refreshRate;
            }
            config.mapSettings.spatialConnectId = model.mapSettings.spatialConnectId;
            config.mapSettings.mapProjectionId = model.mapSettings.mapProjectionId;
            config.mapSettings.displayProjectionId = model.mapSettings.displayProjectionId;
            config.mapSettings.coordinatesFormat = model.mapSettings.coordinatesFormat;
            config.mapSettings.scaleBarUnits = model.mapSettings.scaleBarUnits;
        }else if(!changed){
            if(settingsLevel === 'user'){
                config.mapSettings = undefined;
            }else{
                config.mapSettings = {};
                if(settingsLevel === 'admin'){
                    config.mapSettings.refreshStatus = model.mapSettings.refreshStatus;
                    config.mapSettings.refreshRate = model.mapSettings.refreshRate;
                }
                config.mapSettings.spatialConnectId = model.mapSettings.spatialConnectId;
                config.mapSettings.mapProjectionId = model.mapSettings.mapProjectionId;
                config.mapSettings.displayProjectionId = model.mapSettings.displayProjectionId;
                config.mapSettings.coordinatesFormat = model.mapSettings.coordinatesFormat;
                config.mapSettings.scaleBarUnits = model.mapSettings.scaleBarUnits;
            }
        }

        if(settingsLevel === 'report' && !angular.isDefined(config.mapSettings)){
            config.mapSettings = {};
        }

        return config;
    };

    var checkStylesSettings = function(model,settingsLevel,config,changed){
        if(!changed && model.stylesSettings && model.stylesSettings.reseted){
            config.stylesSettings = undefined;
        }else if(changed && model.stylesSettings){
            config.stylesSettings = {};
            var styleTypes = ['position','segment','alarm'];

            angular.forEach(styleTypes,function(item){
                if (angular.isDefined(model[item + 'Style'])){
                    var properties = {};

                    if(item==='alarm'){
                        properties.size = model.alarmStyle.size;
                        for (var i = 0; i < model.alarmStyle.style.length; i++){
                            properties[model.alarmStyle.style[i].id] = model.alarmStyle.style[i].color;
                        }
                    }else{
                        properties.attribute = model[item + 'Style'].attribute;
                        properties.style = {};

                        if(item==='segment'){
                            properties.style.lineStyle = model.segmentStyle.lineStyle;
                            properties.style.lineWidth = model.segmentStyle.lineWidth;
                        }

                        switch (properties.attribute) {
                            case "speedOverGround":
                            case "distance":
                            case "duration":
                            case "courseOverGround":
                            case "reportedSpeed":
                            case "calculatedSpeed":
                            case "reportedCourse":
                                angular.forEach(model[item + 'Style'].style, function(item){
                                    properties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
                                });
                                properties.style["default"] = model[item + 'Style'].defaultColor;
                                break;
                            case "countryCode":
                                angular.forEach(model[item + 'Style'].style, function(item){
                                    properties.style[item.code] = item.color;
                                });
                                break;
                            case "activity":
                            case "type":
                            case "segmentCategory":
                                angular.forEach(model[item + 'Style'].style, function(item){
                                    properties.style[item.code] = item.color;
                                });
                                properties.style["default"] = model[item + 'Style'].defaultColor;
                                break;
                            default:
                                break;
                        }
                    }
                    config.stylesSettings[item + 's'] = properties;
                }
            });
        }else if(!changed){
            if(settingsLevel === 'user'){
                config.stylesSettings = undefined;
            }else{
                config.stylesSettings = model.stylesSettings;
                delete config.stylesSettings.positionStyle;
                delete config.stylesSettings.segmentStyle;
                delete config.stylesSettings.alarmStyle;
            }
        }

	    return config;
	};

    var checkVisibilitySettings = function(model,settingsLevel,config,changed){
        var visibilityTypes = ['position','segment','track'];
        var contentTypes = ['Table','Popup','Label'];
        if(!changed && (model.visibilitySettings && model.visibilitySettings.reseted || settingsLevel === 'user')){
            config.visibilitySettings = undefined;
        }else if((changed && model.visibilitySettings) || (!changed && settingsLevel !== 'user')){
            config.visibilitySettings = {};
            angular.forEach(visibilityTypes, function(visibType) {
                config.visibilitySettings[visibType + 's'] = {};
                angular.forEach(contentTypes, function(contentType) {
                    config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()] = [];
                    if(visibType !== 'track' || visibType === 'track' && contentType === 'Table'){
                        var visibilityCurrentSettings = model.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
                        var visibilityCurrentAttrs = model.visibilitySettings[visibType + contentType + 'Attrs'];
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
                    config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()] =
                    model.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
                    //delete config.visibilitySettings[visibType + contentType + 'Attrs'];
                });
            });
        }

        if (angular.isDefined(config.visibilitySettings)){
            angular.forEach(visibilityTypes, function(visibType){
                angular.forEach(contentTypes, function(contentType){
                    delete config.visibilitySettings[visibType + contentType + 'Attrs'];
                });
            });
        }

        return config;
    };


    var checkLayerSettings = function(model,settingsLevel,config,changed){
        if(settingsLevel === 'report'){
            config.layerSettings = model.layerSettings;
        }else if(!changed && (model.layerSettings && model.layerSettings.reseted || settingsLevel === 'user')){
    		config.layerSettings = undefined;
    	}else if((changed && model.layerSettings) || (!changed && settingsLevel !== 'user')){
            config.layerSettings = {};
            var layerTypes = ['port','area','additional','base'];

            angular.forEach(layerTypes,function(item){
                if(angular.isDefined(model.layerSettings[item + 'Layers']) && !_.isEmpty(model.layerSettings[item + 'Layers'])){
                    var layers = [];
                    angular.forEach(model.layerSettings[item + 'Layers'], function(value,key) {
                        var layer;
                        if(item === 'area'){
                            switch (value.areaType) {
                                case 'sysarea':
                                    layer = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'order': key};
                                    break;
                                case 'userarea':
                                    layer = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'gid': value.gid, 'order': key};
                                    break;
                                case 'areagroup':
                                    layer = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'areaGroupName': value.name, 'order': key};
                                    break;
                            }
                        }else{
                            layer = {'serviceLayerId': value.serviceLayerId, 'order': key};
                        }
                        layers.push(layer);
                    });
                    config.layerSettings[item + 'Layers'] = [];
                    angular.copy(layers,config.layerSettings[item + 'Layers']);
                }else{
                    config.layerSettings[item + 'Layers'] = undefined;
                }
            });
	    }
        return config;
    };

    var checkReferenceDataSettings = function(model,settingsLevel,config,changed){
    	if(!changed && (model.referenceDataSettings && model.referenceDataSettings.reseted || settingsLevel === 'user')){
            config.referenceDataSettings = undefined;
        }else if((changed && model.referenceDataSettings) || (!changed && settingsLevel !== 'user')){
            config.referenceDataSettings = model.referenceDataSettings;
        }
        return config;
    };

    var sortArray = function(data){
        var temp = _.clone(data);
        temp.sort();

        return temp;
    };

    var fixIndividualUserAreas = function (layerSettings){
        if (angular.isDefined(layerSettings.areaLayers) && layerSettings.areaLayers.length > 0){
            angular.forEach(layerSettings.areaLayers, function(item) {
            	if (item.areaType === 'userarea'){
            	    item.name = item.areaName;
            	}
            }, layerSettings.areaLayers);
        }
    };

    var removeLayerHashKeys = function(obj){
        angular.forEach(obj, function(type) {
            angular.forEach(type, function(item) {
                delete item.$$hashKey;
            });
    	});
    };

	return SpatialConfig;
});
