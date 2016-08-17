/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name areaHelperService
 * @param locale {service} angular locale service
 * @param areaMapService {service} area map service<p>{@link unionvmsWeb.areaMapService}</p>
 * @param spatialRestService {service} Spatial REST API service
 * @param areaAlertService {service} alert service for the area management tab
 * @param areaRestService {service} Area REST API service
 * @param areaClickerService {service} area map click service
 * @param loadingStatus {service} loading status service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @attr isEditing {Boolean} Indicates whether there is an active editing session (drawing vectors). Default is <b>false</b>
 * @attr displayedLayerType {String} The type of layer (USERAREA, EEZ, ..)  being displayed in the map
 * @attr displayedSystemAreaLayer {String} The reference data type being last displayed in the reference data tab
 * @attr displayedUserAreaGroup {String} The user group type being last displayed in the groups tab
 * @attr systemAreaTypes {Array|undefined} An array containing the source objects describing each reference data type layer or undefined
 * @attr sysAreasEditingType {String} Editing type used in the reference data tab. Possible values are: upload, metadata and dataset. Default is <b>upload</b>
 * @attr systemAreaItems {Array} An array containing the reference data types to use in the combobox
 * @attr userAreasGroups {Array} An array containing the area groups to use in the combobox 
 * @attr isLoadingSysAreaTypes {Boolean} Indicates whether reference data area types are being loaded and is used in reference data types combobox. Default is <b>false</b>
 * @attr isLoadingAreaTypes {Boolean} Indicates whether user area types are being loaded and is used in user area types combobox. Default is <b>false</b>
 * @attr metadata {Object} An object containing metadata info (id, areaName, areaDesc, shortCopy, longCopy) for the reference data layers
 * @description
 *  Service to control the map on the liveview of the reporting tab
 */
angular.module('unionvmsWeb').factory('areaHelperService',function(locale, areaMapService, spatialRestService, areaAlertService, areaRestService, areaClickerService, loadingStatus) {
	var areaHelperService = {
	    isEditing: false,
	    displayedLayerType: undefined,
	    displayedSystemAreaLayer: undefined,
	    displayedUserAreaGroup: undefined,
	    systemAreaTypes: undefined,
	    sysAreasEditingType: 'upload', //Possible values are: upload, metadata, dataset
	    systemAreaItems: [],
	    userAreasGroups: [],
	    isLoadingSysAreaTypes: false,
	    isLoadingAreaTypes: false,
	    currentTab: undefined,
	    metadata: {
	        id: undefined,
	        areaName: undefined,
	        areaDesc: undefined,
	        shortCopy: undefined,
	        longCopy: undefined
	    },
	    slider: {
	        active: false,
	        layer: 'USERAREA',
	        transparency: 0
	    },
	    /**
	     * Set reference data metadata object
	     * 
	     * @memberof areaHelperService
	     * @public
	     * @param {Object} data - The source object containing the metadata info
	     */
	    setMetadata: function(data){
	        this.metadata.id = data.id;
	        this.metadata.areaName = data.name;
	        this.metadata.areaDesc = data.layerDesc;
	        this.metadata.shortCopy = data.shortCopyright;
	        this.metadata.longCopy = data.longCopyright;
	    },
	    /**
	     * Reset the metadata object
	     * 
	     * @memberof areaHelperService
	     * @public
	     */
	    resetMetadata: function(){
	        var keys = _.keys(this.metadata);
	        for (var i = 0; i < keys.length; i++){
	            this.metadata[keys[i]] = undefined;
	        }
	    },
	    /**
	     * Clear this service attributes
	     * 
	     * @mmeberof areaHelperService
	     * @public
	     */	    
	    clearHelperService: function(){
	        this.isEditing = false;
	        this.displayedLayerType = undefined;
	        this.displayedSystemAreaLayer = undefined;
	        this.displayedUserAreaGroup = undefined;
	        this.resetMetadata();
	    },
	    /**
	     * Update the slider with new layer and transparency setting
	     * 
	     * @memberof areaHelperService
         * @public
         * @param {String|Undefined} type - The layer type to associate with the slider or undefined to reset the slider
	     */
	    updateSlider: function(type){
	        this.slider.layer = type;
            this.slider.transparency = 0;
	    },
	    /**
	     * React to tab changes and remove and add the necessary layers through the areaMapService ({@link unionvmsWeb.areaMapService})
	     * @memberof areaHelperService
	     * @public
	     * @param {String} destTab - The destination tab name
	     */
	    tabChange: function(destTab){
	        this.currentTab = destTab;
	        areaClickerService.deactivate();
	        areaMapService.removeAreaLayers();
	        this.displayedLayerType = undefined;
	        
	        if (angular.isDefined(destTab)){
	            loadingStatus.isLoading('AreaManagementPanel', true);
	            if (destTab === 'USERAREAS'){
	                getUserAreaLayer(this);
	                this.updateSlider('USERAREA');
	                this.displayedLayerType = 'USERAREAS';
	            } else if (destTab ===  'SYSAREAS'){
	                getAreaLocationLayers(this);
	                if (angular.isDefined(this.displayedSystemAreaLayer)){
	                    this.displayedLayerType = this.displayedSystemAreaLayer;
	                    var item = getAreaLocationLayerDef(this);
	                    item.areaType = 'SYSAREA';
	                    areaMapService.addWMS(item);
	                    this.updateSlider(this.displayedSystemAreaLayer);
	                } else {
	                    this.updateSlider(undefined);
	                }
	                if (this.sysAreasEditingType === 'dataset'){
	                    areaClickerService.active = true;
	                }
	            }else if(destTab ===  'AREAGROUPS'){
	            	getUserAreasGroupsList(this);
	            	if (angular.isDefined(this.displayedUserAreaGroup)){
	            	    this.displayedLayerType = 'AREAGROUPS';
	            	    this.getUserAreaGroupLayer(this.displayedUserAreaGroup);
	            	    this.updateSlider(this.displayedLayerType);
	            	} else {
	            	    this.updateSlider(undefined);
	            	}
	            }
	        }
	        
	        if (!angular.isDefined(this.displayedLayerType)){
	            loadingStatus.isLoading('AreaManagementPanel', false);
	        }
	    },
	    /**
	     * Get user area group layer definitions and add the layer through the areaMapService<p>{@link unionvmsWeb.areaMapService}</p>
	     * 
	     * @memberof areaHelperService
	     * @public
	     * @param {String} type - The user area group type
	     */
	    getUserAreaGroupLayer: function(type){
	        getUserAreaGroupLayer(this, type);
	    },
	    /**
	     * Load user areas layer on initial map setup
	     * 
	     * @memberof areaHelperService
	     * @public
	     */
	    lazyLoadUserAreas: function(){
	        getUserAreaLayer(this);
	    }
	};
	
	/**
	 * Get Area location layer defintion (reference data) by type
	 * 
	 * @memberof areaHelperService
	 * @private
	 * @param {Object} obj - areaHelperService object
	 * @returns {Object} The source object containing the area layer definitions  
	 */
	var getAreaLocationLayerDef = function(obj){
	    for (var i = 0; i < obj.systemAreaTypes.length; i++){
	        if (obj.systemAreaTypes[i].typeName === obj.displayedSystemAreaLayer){
	            return obj.systemAreaTypes[i];
	        }
	    }
	};
	
	/**
	 * Get user area group layer from REST api and add it to the map
	 * 
	 * @memberof areaHelperService
	 * @private
	 * @param {Object} obj - areaHelperService object
	 * @param {String} type - the user area group type
	 */
	var getUserAreaGroupLayer = function(obj, type){
	    var layer = areaMapService.getLayerByType('AREAGROUPS');
	    if (angular.isDefined(layer)){
	        var layerSrc = layer.getSource();
	        var groupCql = " and type = '" + type + "'";
	        var cql = layer.get('baseCql') + groupCql;
	        layerSrc.updateParams({
                time_: (new Date()).getTime(),
                'cql_filter': cql
            });
	        layer.set('groupCql', groupCql);
	    } else {
	        spatialRestService.getUserAreaLayer().then(function(response){
	            if (!angular.isDefined(areaMapService.getLayerByType('AREAGROUPS')) && obj.currentTab === 'AREAGROUPS'){
	                //override typename for area groups instead
	                response.data.typeName = 'AREAGROUPS';
	                response.data.groupCql = " and type = '" + type + "'";
	                areaMapService.addUserAreasWMS(response.data);
	                obj.displayedLayerType = response.data.typeName;
	            }
	        }, function(error){
	            areaAlertService.setError();
	            areaAlertService.alertMessage = locale.getString('areas.error_getting_user_area_layer');
	            areaAlertService.hideAlert();
	        });
	    }
	    
	};
	
    /**
     * Get user area layer definitions from REST and it to the map
     * 
     * @memberof areaHelperService
     * @private
     * @param {Object} obj - areaHelperService object
     */
    var getUserAreaLayer = function(obj){
        if (angular.isDefined(areaMapService.map)){ //&& areaMapService.map.getLayers().getLength() !== 0
            spatialRestService.getUserAreaLayer().then(function(response){
                if (!angular.isDefined(areaMapService.getLayerByType('USERAREA')) && obj.currentTab === 'USERAREAS'){
                    areaMapService.addUserAreasWMS(response.data);
                    obj.displayedLayerType = response.data.typeName;
                    areaAlertService.removeLoading();
                }
            }, function(error){
                areaAlertService.setError();
                areaAlertService.alertMessage = locale.getString('areas.error_getting_user_area_layer');
                areaAlertService.hideAlert();
            });
        }
    };
    
    /**
     * Get the list of reference data layers
     * 
     * @memberof areaHelperService
     * @private
     * @param {Object} obj - areaHelperService object
     */
    var getAreaLocationLayers = function(obj){
        if (!angular.isDefined(obj.systemAreaTypes)){
        	obj.isLoadingSysAreaTypes = true;
            spatialRestService.getAreaLocationLayers().then(function(response){
                obj.systemAreaTypes = response.data;
                for (var i = 0; i < obj.systemAreaTypes.length; i++){
                    obj.systemAreaItems.push({"text": obj.systemAreaTypes[i].typeName, "code": obj.systemAreaTypes[i].typeName});
                }
                obj.isLoadingSysAreaTypes = false;
            }, function(error){
            	areaAlertService.setError();
                areaAlertService.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
                areaAlertService.hideAlert();
                obj.isLoadingSysAreaTypes = false;
            });
        }
    };
    
    /**
     * Get the list of user areas groups
     * 
     * @memberof areaHelperService
     * @private
     * @param {Object} obj - areaHelperService object
     */
    var getUserAreasGroupsList = function(obj){
    	obj.isLoadingAreaTypes = true;
        areaRestService.getUserAreaTypes().then(function(response){
        	if (angular.isDefined(response)) {
        		var areaGroups = [];
        		for(var i=0;i<response.length;i++){
        			areaGroups.push({code: response[i],text: response[i]});
        		}
        		obj.userAreasGroups = areaGroups;
        	}
        	obj.isLoadingAreaTypes = false;
        }, function(error){
        	areaAlertService.setError();
        	areaAlertService.alertMessage = locale.getString('areas.error_getting_userarea_types');
        	areaAlertService.hideAlert();
        	obj.isLoadingAreaTypes = false;
        });
    };
    
    /**
     * Configure all modals when in fullscreen mode
     * 
     * @memberof areaHelperService
     * @public
     * @alias configureFullscreenModal
     * @param {Object} modalInstance - The modal instance object
     */
	areaHelperService.configureFullscreenModal = function(modalInstance) {
        modalInstance.rendered.then(function(){
            $('body > .modal[uib-modal-window="modal-window"]').not($('.alert-modal-content')).appendTo('#areaMap');
            $('[uib-modal-backdrop="modal-backdrop"]').not($('.alert-modal-backdrop')).appendTo('#areaMap');
        });
    };

	return areaHelperService;
});