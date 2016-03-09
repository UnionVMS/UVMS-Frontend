angular.module('unionvmsWeb').factory('areaHelperService',function(locale, areaMapService, spatialRestService, areaAlertService, areaRestService) {

	var areaHelperService = {
	    isEditing: false,
	    displayedLayerType: undefined,
	    displayedSystemAreaLayer: undefined,
	    systemAreaTypes: undefined,
	    systemAreaItems: [],
	    userAreasGroups: [],
	    metadata: {
	        id: undefined,
	        areaName: undefined,
	        areaDesc: undefined,
	        shortCopy: undefined,
	        longCopy: undefined
	    },
	    setMetadata: function(data){
	        this.metadata.id = data.id;
	        this.metadata.areaName = data.name;
	        this.metadata.areaDesc = data.layerDesc;
	        this.metadata.shortCopy = data.shortCopyright;
	        this.metadata.longCopy = data.longCopyright;
	    },
	    resetMetadata: function(){
	        var keys = _.keys(this.metadata);
	        for (var i = 0; i < keys.length; i++){
	            this.metadata[keys[i]] = undefined;
	        }
	    },
	    clearHelperService: function(){
	        if (angular.isDefined(this.displayedSystemAreaLayer)){
	            areaMapService.removeLayerByType(this.displayedSystemAreaLayer);
	            this.displayedSystemAreaLayer = undefined;
	        }
	        this.isEditing = false;
	        this.displayedLayerType = undefined;
	        this.resetMetadata();
	    },
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
	                if (angular.isDefined(this.displayedSystemAreaLayer)){
	                    this.displayedLayerType = this.displayedSystemAreaLayer;
	                    var item = getAreaLocationLayerDef(this);
	                    areaMapService.addWMS(item);
	                }
	            }else if(destTab ===  'AREAGROUPS'){
	            	getUserAreasGroupsList(this);
	            	getUserAreaLayer(this);
	            }
	        }
	    }
	};
	
	//Get AreaLocationLayer by type
	var getAreaLocationLayerDef = function(obj){
	    for (var i = 0; i < obj.systemAreaTypes.length; i++){
	        if (obj.systemAreaTypes[i].typeName === obj.displayedSystemAreaLayer){
	            return obj.systemAreaTypes[i];
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
                areaAlertService.hideAlert();
            });
        }
    };
    
    //USER AREAS GROUPS LIST
    var getUserAreasGroupsList = function(obj){
        areaRestService.getUserAreaTypes().then(function(response){
        	if (angular.isDefined(response)) {
        		var areaGroups = [];
        		for(var i=0;i<response.length;i++){
        			areaGroups.push({code: i,text: response[i]});
        		}
        		obj.userAreasGroups = areaGroups;
        	}
        }, function(error){
        	areaAlertService.setError();
        	areaAlertService.alertMessage = locale.getString('areas.error_getting_userarea_types');
        	areaAlertService.hideAlert();
        });
    };

	return areaHelperService;
});