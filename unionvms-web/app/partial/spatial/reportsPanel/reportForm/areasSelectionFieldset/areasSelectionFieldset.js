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
 * @ngdoc controller
 * @name AreasselectionfieldsetCtrl
 * @param $scope {service} controller scope
 * @param $modalInstance {service} bootstrap modal service
 * @param $interval {service} angular interval service
 * @param $timeout {service} angular timeout service
 * @param locale {service} angular locale service
 * @param mapReference {service} Service containing the reference of the map
 * @param loadingStatus {service} loading message service
 * @param genericMapService {service} generic map service <p>{@link unionvmsWeb.genericMapService}</p>
 * @param selectedAreas {Array} An array containing all report selected areas passed through the resolve function of the modalInstance
 * @param spatialRestService {service} Spatial REST API service
 * @param Area {service} Area model service
 * @param userService {service} USM user service
 * @param projectionService {service} map projection service <p>{@link unionvmsWeb.projectionService}</p>
 * @attr areaTabs {Array} An array containing the tabs definition objects
 * @attr selectedTab {String} The currently selected tab. Possible values are: SYSTEM and USER. Default is <b>SYSTEM</b>
 * @attr isLoadingAreaLayers {Boolean} True if request is being made to the Spatial REST API to receive area layers. Default is <b>false</b>
 * @attr systemAreaTypes {Array} An array containing all available system area types (source data)
 * @attr systemItems {Array} An array containing the available system area types to be used in the system area selection combobox
 * @attr selectionType {Object} Selection type being used in both tabs (SYSTEM and USER). Possible values are: map and search. Default is <b>map</b>
 * @attr clickResults {Number} The total number of resuts returned by a click in the map.
 * @attr showWarning {Boolean} Whether there is a warning or not. Deafult is <b>false</b>
 * @attr warningMessage {String} The warning message to display. Default is <b>undefined</b>
 * @attr hasError {Boolean} Whether the warning is an error or not. Deafult is <b>false</b>
 * @attr searchString {String} The search string to search areas by properties. Default is <b>undefined</b>
 * @attr searchedAreas {Array} An array containing all the areas that were fetched by property search
 * @description
 *  The controller of the area selection fieldset used in the report form
 */
angular.module('unionvmsWeb').controller('AreasselectionfieldsetCtrl',function($scope, /*$modalInstance,*/ $interval, $timeout, locale, mapReference, loadingStatus, genericMapService, /*selectedAreas,*/ spatialRestService, Area, userService, projectionService){
    mapReference.areaSelection = {};
    debugger;

    /**
     * Initializing function that is called when the modal is opened
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var init = function(){
        loadingStatus.isLoading('AreaSelectionFieldset',true);
        $scope.selectedTab = 'SYSTEM';
        $scope.isLoadingAreaLayers = false;
        $scope.systemAreaTypes = [];
        $scope.systemItems = [];
        $scope.selectionType = {
            SYSTEM: 'map',
            USER: 'map'
        };
        $scope.clickResults = 0;
        $scope.hasError = false;
        $scope.showWarning = false;
        $scope.warningMessage = undefined;
        $scope.searchString = undefined;
        $scope.searchedAreas = [];
        $scope.displayedAreas = [].concat($scope.searchedAreas);
        $scope.itemsByPage = 5;

        $scope.areaTabs = setTabs();
        setSystemItems();
        genericMapService.setMapBasicConfigs($scope.setMap);
    };



    /**
     * Set the available tabs array
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     * @returns {Array} An array with the tab definition objects
     */
    var setTabs = function(){
        return [
            {
                'tab': 'SYSTEM',
                'title': locale.getString('spatial.area_selection_modal_system_tab')
            },
            {
                'tab': 'USER',
                'title': locale.getString('spatial.area_selection_modal_user_tab')
            }
        ];
    };

    /**
     * Select a tab
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias selectTab
     * @param {String} tab -  the tab name to select
     */
    $scope.selectTab = function(tab){
        $scope.clickResults = 0;
        $scope.clearSearchProps();
        $scope.selectedTab = tab;
        if (tab === 'USER') {
            if (angular.isDefined($scope.sysAreaType)){
                $scope.removeLayerByType($scope.sysAreaType);
            }

            if (!angular.isDefined($scope.userAreaType)){
                setUserAreaType();
            } else {
                lazyLoadWMSLayer();
            }
        } else {
            if (angular.isDefined($scope.userAreaType)){
                $scope.removeLayerByType($scope.userAreaType.typeName);
            }

            if (angular.isDefined($scope.sysAreaType)){
                lazyLoadWMSLayer();
            }
        }
    };

    /**
     * Set the user area type layer definitions from Spatial REST API
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var setUserAreaType = function() {
        if(!angular.isDefined($scope.userAreaType)) {
            spatialRestService.getUserAreaLayer().then(function(response){
                debugger;
                $scope.userAreaType = response.data;
                $scope.userAreaType.cql = "(user_name = '" + userService.getUserName() + "' OR scopes ilike '%#" + userService.getCurrentContext().scope.scopeName +"#%')";
                if ($scope.selectionType[$scope.selectedTab] === 'map'){
                    lazyLoadWMSLayer();
                }
            }, function(error){
                $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
                setWarning(true);
                hideAlert();
            });
        }
    };

    /**
     * Check if a tab is selected
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias isTabSelected
     * @param {String} tab - The name of the tab to check
     * @returns {Boolean} True if tab is selected, otherwise false
     */
    $scope.isTabSelected = function(tab){
        return $scope.selectedTab === tab;
    };

    /**
     * Set the source system areas array (systemAreaTypes) and the system areas combobox items (systemItems)
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var setSystemItems = function(){
        $scope.isLoadingAreaLayers = true;
        spatialRestService.getAreaLayers().then(function(response){
            $scope.systemAreaTypes = response.data;
            for (var i = 0; i < $scope.systemAreaTypes.length; i++){
                $scope.systemItems.push({"text": $scope.systemAreaTypes[i].typeName, "code": $scope.systemAreaTypes[i].typeName});
            }
            $scope.isLoadingAreaLayers = false;
            loadingStatus.isLoading('AreaSelectionFieldset',false);
        }, function(error){
            $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
            setWarning(true);
            hideAlert();
            $scope.isLoadingAreaLayers = false;
            loadingStatus.isLoading('AreaSelectionFieldset',false);
        });
    };

    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.clickResults = 0;
            $scope.clearSearchProps();
            $scope.removeLayerByType(oldVal);
            if ($scope.selectionType[$scope.selectedTab] === 'map'){
                lazyLoadWMSLayer();
            }
        }
    });

    $scope.$watch('selectionType.SYSTEM', function(newVal, oldVal){
        selectionTypeChange(newVal, oldVal);
    });

    $scope.$watch('selectionType.USER', function(newVal, oldVal){
        selectionTypeChange(newVal, oldVal);
    });

    /**
     * @memberof AreasselectionfieldsetCtrl
     * @private
     * @param {String} newVal - The new selection type value
     * @param {String} oldVal - The old selection type value
     */
    var selectionTypeChange = function(newVal, oldVal){
        $scope.clickResults = 0;
        $scope.clearSearchProps();
        if (newVal === 'map'){
            lazyLoadWMSLayer();
        }
    };

    /**
     * Get full area definition for the selected system area type
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias getFullDefForItem
     * @param {String} type - The system are type
     * @returns {Object} The source definition object of the area type
     */
    $scope.getFullDefForItem = function(type){
        debugger
        var item;
        for (var i = 0; i < $scope.systemAreaTypes.length; i++){
            if ($scope.systemAreaTypes[i].typeName === type){
                 item = $scope.systemAreaTypes[i];
            }
        }
        return item;
    };

    /**
     * Get area layer properties so that they can be used for the tooltips showing the area image
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias getPropsForToolTip
     */
    $scope.getPropsForToolTip = function(){
        var def;
        if ($scope.selectedTab === 'SYSTEM'){
            def = $scope.getFullDefForItem($scope.sysAreaType);
        } else {
            def = $scope.userAreaType;
        }

        if (angular.isDefined(def)){
            return {
                url: def.serviceUrl,
                layer: def.geoName,
                style: angular.isDefined(def.style) ? def.style : null,
                cqlProperty: 'gid',
                propertyType: 'number',
                includeStyle: false
            };
        }
    };

    /**
     * Select areas by click on the map
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias selectAreaFromMap
     * @param {Object} data - Object to send in the request to the Spatial REST API
     */
    $scope.selectAreaFromMap = function(data){
        debugger;
        loadingStatus.isLoading('AreaSelectionFieldset',true);
        spatialRestService.getAreaDetails(data).then(function(response){
            var area;
            $scope.clickResults = response.data.length;
            if (response.data.length > 1){
                $scope.searchedAreas = convertAreasResponse(response.data, data.areaType);
            } else {
                if (response.data.length === 0){
                    $scope.showWarning = true;
                    $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_sys_area_details_empty_result');
                    hideAlert();
                } else {
                    response.data[0].areaType = data.areaType;
                    area = new Area();
                    area = area.fromJson(response.data[0]);
                    if ($scope.checkAreaIsSelected(area) === false){
                        area.isSelected = true;
                        $scope.selectedAreas.push(area);
                        $scope.reportBodyForm.$setDirty();
                    }
                }
            }
            loadingStatus.isLoading('AreaSelectionFieldset',false);
        }, function(error){
            $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_sys_area_details_error');
            setWarning(true);
            hideAlert();
            loadingStatus.isLoading('AreaSelectionFieldset',false);
        });
    };

    /**
     * Select area from table
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias selectAreaFromTable
     * @param {Object} record - Area object record
     */
    $scope.selectAreaFromTable = function(record){
        $scope.reportBodyForm.$setDirty();
        if (record.isSelected){
            $scope.removeArea(record, false);
        } else {
            var tempRec = _.clone(record);
            tempRec.isSelected = true;
            $scope.selectedAreas.push(record);
        }
        record.isSelected = !record.isSelected;
    };

    /**
     * Select all areas from table
     *
     * @public
     * @alias selectAllAreasFromTable
     */
    $scope.selectAllAreasFromTable = function(){
        if(angular.isDefined($scope.searchedAreas) && $scope.searchedAreas.length > 0){
            $scope.reportBodyForm.$setDirty();
        }
        angular.forEach($scope.searchedAreas, function(record) {
            if (!record.isSelected){
                record.isSelected = true;
                $scope.selectedAreas.push(record);
            }
        });
    };

    /**
     * Search areas by properties
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias searchByProps
     */
    $scope.searchByProps = function(){
        if (angular.isDefined($scope.searchString) && $scope.searchString !== ''){
            loadingStatus.isLoading('AreaSelectionFieldset',true);
            var requestData = {
                filter: $scope.searchString
            };
            var funcName;
            if ($scope.isTabSelected('SYSTEM')){
                requestData.areaType = $scope.sysAreaType;
                funcName = 'getAreasByFilter';
            } else {
                funcName = 'getUserAreasByFilter';
            }

            spatialRestService[funcName](requestData).then(function(response){
                $scope.searchedAreas = convertAreasResponse(response.data);
                loadingStatus.isLoading('AreaSelectionFieldset',false);
            }, function(error){
                loadingStatus.isLoading('AreaSelectionFieldset',false);
                $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_selected_area_search_error');
                setWarning(true);
                hideAlert();
            });
        }
    };

    /**
     * Convert server data from search by properties into an array using the Area Model object
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     * @param {Array} data - The server side array with area data
     * @param {String} areaType - The type of area
     * @returns {Array} An array with area model objects
     */
    var convertAreasResponse = function(data, areaType){
        debugger;
        var areas = [];

        angular.forEach(data, function(rec) {
            if (angular.isDefined(areaType)){
                rec.areaType = areaType;
            }
            var area = new Area();
            area = area.fromJson(rec);
            area.isSelected = _.findIndex($scope.selectedAreas, {areaType: area.areaType, gid: area.gid}) === -1 ? false : true;
            areas.push(area);
        });

        return areas;
    };

    /**
     * Clear search string and results
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias clearSearchProps
     */
    $scope.clearSearchProps = function(){
        $scope.searchString = undefined;
        $scope.searchedAreas = [];
    };

    /**
     * Check if an area is already selected
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias checkAreaIsSelected
     * @param {Object} item - The area object
     * @returns {Boolean} - True if the area is selected, otherwise false
     */
    $scope.checkAreaIsSelected = function(item){
        var status = false;
        $scope.showWarning = false;
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            if (parseInt($scope.selectedAreas[i].gid) === item.gid && $scope.selectedAreas[i].areaType === item.areaType){
                status = true;
                $scope.warningMessage = locale.getString('spatial.area_selection_modal_area_is_selected_warning');
                setWarning(false);
            }
        }

        if ($scope.showWarning === true){
            hideAlert();
        }

        return status;
    };

    /**
     * Remove area from selection
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias removeArea
     * @param {Object} area - The area object from Area Model
     * @param {Booelan} fromCard - True if the remove action was fired from the card displaying the selected areas
     */
    $scope.removeArea = function(area, fromCard){
        var idx = _.findIndex($scope.selectedAreas, {gid: area.gid,areaType: area.areaType});

        if (idx !== -1){
            $scope.reportBodyForm.$setDirty();
            $scope.selectedAreas.splice(idx, 1);
        }

        if (fromCard){
            var rec = _.findWhere($scope.searchedAreas, {gid: area.gid, areaType: area.areaType});
            if (angular.isDefined(rec)){
                rec.isSelected = false;
            }
        }
    };

    /**
     * Remove all selected areas
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias removeAllAreas
     */
    $scope.removeAllAreas = function(){
        if($scope.selectedAreas.length > 0){
            $scope.reportBodyForm.$setDirty();
        }
        $scope.selectedAreas.splice(0,$scope.selectedAreas.length);
        if ($scope.searchedAreas.length !== 0){
            angular.forEach($scope.searchedAreas, function(record) {
            	record.isSelected = false;
            });
        }
    };

    /**
     * Go back to map visualization after displaying areas table on map click with multiple results
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias goBackToMap
     */
    $scope.goBackToMap = function(){
        $scope.clickResults = 0;
        lazyLoadWMSLayer();
    };

    /**
     * Gets the tooltip to display the total number of selected areas
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias getSelectionTip
     * @param {Number} number - The number of selected area
     * @returns {String} The tooltip string with total number of selected areas
     */
    $scope.getSelectionTip = function(number){
        return number + ' ' + locale.getString('spatial.areas_selection_tooltip');
    };

    /**
     * Set warning properties
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     * @oaram {Boolean} True if the warning is an error, false if it is just a warning
     */
    var setWarning = function(isError){
        $scope.showWarning = true;
        $scope.hasError = isError;
    };

    /**
     * Hide the error|warning alert row
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var hideAlert = function(){
        $timeout(function(){
            $scope.hasError = false;
            $scope.showWarning = false;
            $scope.warningMessage = undefined;
        }, 5000);
    };

    /**
     * Set the map
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     * @alias setMap
     */
    $scope.setMap = function(clicked){
        if(clicked && $scope.selectionType[$scope.selectedTab] !== 'map'){
            return;
        }
        var projObj;
        if (angular.isDefined(genericMapService.mapBasicConfigs.success)){
            if (genericMapService.mapBasicConfigs.success){
                projObj = genericMapService.mapBasicConfigs.projection;
            } else {
                //Fallback mode
                projObj = projectionService.getStaticProjMercator();
            }
        }

        if(!angular.isDefined(projObj)){
            return;
        }

        var view = genericMapService.createView(projObj);

        var controls = [];
        controls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));

        controls.push(genericMapService.createZoomCtrl()); //'ol-zoom-right-side'

//        controls.push(new ol.control.ResetLayerFilter({
//            //controlClass: 'ol-resetCql-right-side',
//            type: 'areamapservice',
//            label: locale.getString('areas.map_tip_reset_layer_filter')
//        }));

        var interactions = genericMapService.createZoomInteractions();
        interactions = interactions.concat(genericMapService.createPanInteractions());

        var map = new ol.Map({
            target: 'area-selection-map',
            controls: controls,
            interactions: interactions,
            logo: false
        });

        map.setView(view);
        mapReference.areaSelection.map = map;

        addBaseLayers();

        var layers = map.getLayers();
        if (layers.getLength() > 1){
            var switcher = new ol.control.LayerSwitcher({
                controlClass: 'left-side-up'
            });
            map.addControl(switcher);
        }

        map.on('singleclick', function(evt){
            debugger;
            if ($scope.selectionType[$scope.selectedTab] === 'map' && (($scope.isTabSelected('SYSTEM') && angular.isDefined($scope.sysAreaType)) || ($scope.isTabSelected('USER') && angular.isDefined($scope.userAreaType)))){
                var areaType = $scope.isTabSelected('SYSTEM') ? $scope.sysAreaType : $scope.userAreaType.typeName;
                $scope.clickResults = 0;
                var projection = map.getView().getProjection().getCode();

                var requestData = {
                    areaType: areaType,
                    isGeom: false,
                    longitude: evt.coordinate[0],
                    latitude: evt.coordinate[1],
                    crs: projection.split(':')[1]
                 };
                 $scope.selectAreaFromMap(requestData);
            }
        });

        if (angular.isDefined($scope.sysAreaType)){
            lazyLoadWMSLayer();
        }
    };

    /**
     * Add base layer to the map
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var addBaseLayers = function (){
        if (!genericMapService.mapBasicConfigs.success){
            $scope.addOSM();
        } else {
            angular.forEach(genericMapService.mapBasicConfigs.layers.baseLayers, function(layerConf) {
                debugger;
                switch (layerConf.type) {
                    case 'OSM':
                        $scope.addOSM(layerConf);
                        break;
                    case 'WMS':
                        $scope.addWMS(layerConf, true);
                        break;
                    case 'BING':
                        layerConf.title = locale.getString('spatial.layer_tree_' + layerConf.title);
                        $scope.addBing(layerConf, true);
                        break;
                }
            });
        }
    };

    /**
     * Adds OpenStreeMap layer to the map
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias addOSM
     * @param {Object} [config={}] - The layer configuration object
     */
    $scope.addOSM =  function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineOsm(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        mapReference.areaSelection.map.addLayer(layer);
    };

    /**
     * Adds BING layers to the map
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias addBing
     * @param {Object} [config={}] - The layer configuration object
     */
    $scope.addBing = function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineBing(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        mapReference.areaSelection.map.addLayer(layer);
    };

    /**
     * Adds generic WMS layer to the map.
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias addWMS
     * @param {Object} def - The layer defintion object
     * @param {Boolean} isBaselayer - True if layer is a base layer
     */
    $scope.addWMS = function(def, isBaseLayer){
        debugger;
        var config;
        if (isBaseLayer){
            config = genericMapService.getBaseLayerConfig(def, mapReference.areaSelection.map);
        } else {
            config = genericMapService.getGenericLayerConfig(def, mapReference.areaSelection.map);
        }

        var layer = genericMapService.defineWms(config);

        if (isBaseLayer){
            layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        }

        mapReference.areaSelection.map.addLayer(layer);
    };

    /**
     * Stop the interval to add a WMS layer
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var stopWMSInterval = function(){
        $interval.cancel($scope.addWMSInterval);
        delete $scope.addWMSInterval;
    };

    /**
     * Lazy load of WMS layers according to user selections. Used when user navigates from maps to tables and between tabs
     *
     * @memberof AreasselectionfieldsetCtrl
     * @private
     */
    var lazyLoadWMSLayer = function(){
        debugger;
        var item, layerType;
        if (angular.isDefined($scope.sysAreaType) && $scope.isTabSelected('SYSTEM')){
            item = $scope.getFullDefForItem($scope.sysAreaType);
            layerType = $scope.sysAreaType;
        }

        if (angular.isDefined($scope.userAreaType) && $scope.isTabSelected('USER')){
            item = $scope.userAreaType;
            layerType = $scope.userAreaType.typeName;
        }


        if (angular.isDefined(item)){
            if (!angular.isDefined($scope.addWMSInterval)){
                $scope.addWMSInterval = $interval(function(){
                    if (angular.isDefined(mapReference.areaSelection.map)){
                        debugger;
                        var layer = genericMapService.getLayerByType(layerType, mapReference.areaSelection.map);
                        if (!angular.isDefined(layer)){
                            $scope.addWMS(item);
                        }
                        stopWMSInterval();
                    }
                }, 10);
            }
        }
    };

    /**
     * Remove layer from the map by type
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias removeLayerByType
     * @param {String} layerType - The layer type to be removed
     */
    $scope.removeLayerByType = function(layerType){
        if (angular.isDefined(mapReference.areaSelection.map)){
            var mapLayers = mapReference.areaSelection.map.getLayers();
            if (mapLayers.getLength() > 1){
                var layer = mapLayers.getArray().find(function(layer){
                    return layer.get('type') === layerType;
                });
                mapReference.areaSelection.map.removeLayer(layer);
            }
        }
    };

    /**
     * Update the counter and description displayed in the tooltip of the area selection counter
     *
     * @memberof AreasselectionfieldsetCtrl
     * @public
     * @alias updateCounterDescription
     */
    $scope.updateCounterDescription = function(){
        $scope.areaCountDesc = '';
        var areaTypes = _.pluck($scope.selectedAreas, 'areaType');
        areaTypes = _.uniq(areaTypes, true);

        var typesCount = [];

        angular.forEach(areaTypes,function(item){
            var type = {type: item, count: _.where($scope.selectedAreas,{'areaType': item}).length};
            typesCount.push(type);
        });

        var first = true;
        angular.forEach(typesCount,function(item){
            if(first){
                first = false;
            }else{
                $scope.areaCountDesc += '\n';
            }
            $scope.areaCountDesc += item.count + ' ' + item.type;
        });
    };

    $scope.$watch('selectedAreas',function(newVal,oldVal){
        if(newVal !== oldVal){
            $scope.updateCounterDescription();
        }
    },true);

    $scope.$watch('report.showAreaFilter',function(newVal,oldVal){
        if(newVal){
            init();
        }
    });

    init();
});
