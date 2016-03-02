angular.module('unionvmsWeb').factory('areaHelperService',function(locale, areaMapService, spatialRestService, areaAlertService) {

	var areaHelperService = {
	    isEditing: false,
	    displayedLayerType: undefined,
	    systemAreaTypes: undefined,
	    systemAreaItems: [],
	    tabChange: function(destTab){
	        if (angular.isDefined(this.displayedLayerType)){
	            areaMapService.removeLayerByType(this.displayedLayerType);
	            this.displayedLayerType = undefined;
	        }
	        
	        if (angular.isDefined(destTab)){
	            if (destTab === 'USERAREAS'){
	                getUserAreaLayer(this);
	            } else if (destTab ===  'SYSAREAS'){
	                getAreaLocationLayers(this);
	            }
	            
	        }
	    }
	};
	
	//USER AREA LAYER
    var getUserAreaLayer = function(obj){
        spatialRestService.getUserAreaLayer().then(function(response){
            if (!angular.isDefined(areaMapService.getLayerByType('USERAREA'))){
                areaMapService.addUserAreasWMS(response.data);
                obj.displayedLayerType = response.data.typeName;
            }
        }, function(error){
            areaAlertService.setError();
            areaAlertService.alertMessage = locale.getString('areas.error_getting_user_area_layer');
            areaAlertService.hideAlert();
        });
    };
    
    //area location layers for combo in sysareas    
    var getAreaLocationLayers = function(obj){
        if (!angular.isDefined(obj.systemAreaTypes)){
            spatialRestService.getAreaLocationLayers().then(function(response){
                obj.systemAreaTypes = response.data;
                for (var i = 0; i < obj.systemAreaTypes.length; i++){
                    obj.systemAreaItems.push({"text": obj.systemAreaTypes[i].typeName, "code": obj.systemAreaTypes[i].typeName});
                }
            }, function(error){
                areaAlertService.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
                areaAlertService.hasError = true;
                areaAlertService.hideAlerts();
            });
        }
    }

	return areaHelperService;
});