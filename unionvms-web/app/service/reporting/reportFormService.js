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
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name reportFormService
 * @description
 *  Service keep track of executed report and its properties and changes. It allows to store the original and current edited report definitions.
 */
angular.module('unionvmsWeb').factory('reportFormService',function() {

	var reportFormService = {
		report: undefined,
		liveView: {
		    outOfDate: false,
		    editable: false,
		    originalReport: undefined,
		    currentReport: undefined,
		    currentTempReport: undefined
		}
	};
	
	reportFormService.resetLiveView = function(){
	    this.liveView = {
            outOfDate: false,
            editable: false,
            originalReport: undefined,
            currentReport: undefined,
            currentTempReport: undefined
	    }; 
	};
	
	//Check and merge layer settings when saving a report and running a report without saving
	reportFormService.checkLayerSettings = function(layerSettings) {
	    var layerData;
        if(angular.isDefined(layerSettings)){
            layerData = {};
            layerData.portLayers = [];
            if(angular.isDefined(layerSettings.portLayers) && !_.isEmpty(layerSettings.portLayers)){
                var ports = [];
                angular.forEach(layerSettings.portLayers, function(value,key) {
                    var port = {'serviceLayerId': value.serviceLayerId, 'order': key};
                    ports.push(port);
                });
                
                angular.copy(ports,layerData.portLayers);
            }else if(!angular.isDefined(layerSettings.portLayers)){
                layerData.portLayers = undefined;
            }
        
            layerData.areaLayers = [];
            if(angular.isDefined(layerSettings.areaLayers && !_.isEmpty(layerSettings.areaLayers))){
                var areas = [];
                angular.forEach(layerSettings.areaLayers, function(value,key) {
                    var area;
                    switch (value.areaType) {
                        case 'sysarea':
                            area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'order': key};
                            break;
                        case 'userarea':
                            area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'gid': value.gid, 'order': key};
                            break;
                        case 'areagroup':
                            area = {'serviceLayerId': value.serviceLayerId, 'areaType': value.areaType, 'areaGroupName': value.name, 'order': key};
                            break;
                    }
                    areas.push(area);
                });
                
                angular.copy(areas,layerData.areaLayers);
            }else if(!angular.isDefined(layerSettings.areaLayers)){
                layerData.areaLayers = undefined;
            }
            
            layerData.additionalLayers = [];
            if(angular.isDefined(layerSettings.additionalLayers) && !_.isEmpty(layerSettings.additionalLayers)){
                var additionals = [];
                angular.forEach(layerSettings.additionalLayers, function(value,key) {
                    var additional = {'serviceLayerId': value.serviceLayerId, 'order': key};
                    additionals.push(additional);
                });
                
                angular.copy(additionals,layerData.additionalLayers);
            }else if(!angular.isDefined(layerSettings.additionalLayers)){
                layerData.additionalLayers = undefined;
            }
            
            layerData.baseLayers = [];
            if(angular.isDefined(layerSettings.baseLayers) && !_.isEmpty(layerSettings.baseLayers)){
                var bases = [];
                angular.forEach(layerSettings.baseLayers, function(value,key) {
                    var base = {'serviceLayerId': value.serviceLayerId, 'order': key};
                    bases.push(base);
                });
                
                angular.copy(bases,layerData.baseLayers);
            }else if(!angular.isDefined(layerSettings.baseLayers)){
                layerData.baseLayers = undefined;
            }
        }
        return layerData;
    };
    
    reportFormService.checkMapConfigDifferences = function(report){
        if(!angular.equals(report.mapConfiguration, report.currentMapConfig.mapConfiguration)){
            
            if(!angular.equals(report.mapConfiguration.coordinatesFormat, report.currentMapConfig.mapConfiguration.coordinatesFormat)){
                report.mapConfiguration.coordinatesFormat = report.currentMapConfig.mapConfiguration.coordinatesFormat;
            }
            if(!angular.equals(report.mapConfiguration.displayProjectionId, report.currentMapConfig.mapConfiguration.displayProjectionId)){
                report.mapConfiguration.displayProjectionId = report.currentMapConfig.mapConfiguration.displayProjectionId;
            }
            if(!angular.equals(report.mapConfiguration.mapProjectionId, report.currentMapConfig.mapConfiguration.mapProjectionId)){
                report.mapConfiguration.mapProjectionId = report.currentMapConfig.mapConfiguration.mapProjectionId;
            }
            if(!angular.equals(report.mapConfiguration.scaleBarUnits, report.currentMapConfig.mapConfiguration.scaleBarUnits)){
                report.mapConfiguration.scaleBarUnits = report.currentMapConfig.mapConfiguration.scaleBarUnits;
            }
            
            if(!angular.equals(report.mapConfiguration.stylesSettings, report.currentMapConfig.mapConfiguration.stylesSettings)){
                report.mapConfiguration.stylesSettings = report.currentMapConfig.mapConfiguration.stylesSettings;
            }
            if(!angular.equals(report.mapConfiguration.visibilitySettings, report.currentMapConfig.mapConfiguration.visibilitySettings)){
                report.mapConfiguration.visibilitySettings = report.currentMapConfig.mapConfiguration.visibilitySettings;
            }
            if(!angular.equals(report.mapConfiguration.layerSettings, report.currentMapConfig.mapConfiguration.layerSettings)){
                report.mapConfiguration.layerSettings = report.currentMapConfig.mapConfiguration.layerSettings;
            }
            if(!angular.equals(report.mapConfiguration.referenceDataSettings, report.currentMapConfig.mapConfiguration.referenceDataSettings)){
                report.mapConfiguration.referenceDataSettings = report.currentMapConfig.mapConfiguration.referenceDataSettings;
            }
        }
        return report;
    };

	return reportFormService;
});
