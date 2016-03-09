angular.module('unionvmsWeb').controller('UserareasCtrl',function($scope, locale, $modal, projectionService, UserArea, areaHelperService, areaMapService, areaRestService, areaAlertService, spatialRestService, unitConversionService, userService){
    $scope.createBtnTitle = undefined;
    $scope.editBtnTitle = undefined;
    $scope.selectedProj = undefined;
    $scope.userAreasList = [];
    $scope.displayedUserAreas = [].concat($scope.userAreasList);
    $scope.itemsByPage = 5;
    $scope.tableLoading = false;
    $scope.editingType = 'list';
    $scope.isUpdate = false;
    $scope.searchString = '';
    $scope.userAreaTransp = 0;
    $scope.btnAddArea = true;
    $scope.currentContext = undefined;
    $scope.projections = projectionService;
    $scope.helper = areaHelperService;
    $scope.areaTypes = [];
    
    //Distance units
    $scope.selectedUnit = 'm';
    $scope.distUnits = [];
    $scope.distUnits.push({"text": locale.getString('spatial.map_measuring_units_meters'), "code": "m"});
    $scope.distUnits.push({"text": locale.getString('spatial.map_measuring_units_nautical_miles'), "code": "nm"});
    $scope.distUnits.push({"text": locale.getString('spatial.map_measuring_units_miles'), "code": "mi"});
    
    $scope.init = function(){
        $scope.activeTool = undefined;
        $scope.coordVisible = false;
        $scope.userAreaSubmitted = false;
        
        $scope.userArea = UserArea;
        $scope.userArea.reset();
        $scope.bufferRadius = undefined;
        $scope.displayedCoords = [].concat($scope.userArea.coordsArray);

        $scope.currentContext = userService.getCurrentContext();
       
        var availableUserContexts = userService.getContexts();
        $scope.userScopes = [];
        for (var index in availableUserContexts){
            if (angular.isDefined(availableUserContexts[index].scope)) {
                $scope.userScopes.push({
                    "code": availableUserContexts[index].scope.scopeName,
                    "text": availableUserContexts[index].scope.scopeName
                });
            }
            
        }
    };
    
    //Switch editing type
    $scope.setEditingType = function(type){
        if ($scope.editingType === 'edit' && angular.isDefined($scope.activeTool)){
            var fn = 'deactivate' + $scope.activeTool.charAt(0).toUpperCase() + $scope.activeTool.substr(1);
            $scope[fn]();
        }
        $scope.editingType = type;
        if (type === 'edit'){
            $scope.helper.isEditing = true;
        } else {
            $scope.helper.isEditing = false;
        }
    };
    
        
    //EDITING TOOLBAR
    $scope.toggleTool = function(type){
        var fn;
        if (angular.isDefined($scope.activeTool)){
            fn = 'deactivate' + $scope.activeTool.charAt(0).toUpperCase() + $scope.activeTool.substr(1);
            $scope[fn]();
        }
        
        if (type !== $scope.activeTool){
            $scope.activeTool = type;
            fn = 'activate' + type.charAt(0).toUpperCase() + type.substr(1);
            $scope[fn]();
        } else {
            $scope.activeTool = undefined;
        }
    };
    
    $scope.activateDraw = function(){
        $scope.createBtnTitle = locale.getString('areas.create_tool') + ' ' + locale.getString('areas.draw_tool').toLowerCase();
        areaMapService.addDrawControl();
    };
    
    $scope.deactivateDraw = function(){
        $scope.createBtnTitle = locale.getString('areas.create_tool_default_title');
        areaMapService.removeDrawControl();
    };
    
    $scope.activateCircular = function(){
        $scope.createBtnTitle = locale.getString('areas.create_tool') + ' ' + locale.getString('areas.circular_area_tool').toLowerCase();
        areaMapService.addCircularControl();
    };
    
    $scope.deactivateCircular = function(){
        $scope.createBtnTitle = locale.getString('areas.create_tool_default_title');
        areaMapService.removeCircularControl();
        areaMapService.removeVectorFeatures('pointdraw');
        $scope.userArea.resetCentroid();
        $scope.bufferRadius = undefined;
    };
    
    $scope.activateEdit = function(){
        $scope.editBtnTitle = locale.getString('areas.edit_tool') + ': ' + locale.getString('areas.modify_tool').toLowerCase();
        areaMapService.addEditControl();
    };
    
    $scope.deactivateEdit = function(){
        $scope.createBtnTitle = locale.getString('areas.edit_tool_default_title');
        areaMapService.removeEditControl();
    };
    
    $scope.activateDrag = function(){
        $scope.editBtnTitle = locale.getString('areas.edit_tool') + ': ' + locale.getString('areas.drag_tool').toLowerCase();
        areaMapService.addDragControl();
    };
    
    $scope.deactivateDrag = function(){
        $scope.createBtnTitle = locale.getString('areas.edit_tool_default_title');
        areaMapService.removeDragControl();
    };
    
    $scope.activateCoord = function(){
        $scope.coordVisible = true;
    };
    
    $scope.deactivateCoord = function(){
        $scope.coordVisible = false;
    };
    
    $scope.activateImport = function(){
        $scope.importArea();
    };
    
    locale.ready('areas').then(function(){
        $scope.createBtnTitle = locale.getString('areas.create_tool_default_title');
        $scope.editBtnTitle = locale.getString('areas.edit_tool_default_title');
        $scope.init();
        $scope.getProjections();
        $scope.helper.tabChange('USERAREAS');
        if ($scope.userAreasList.length === 0){
            $scope.getUserAreasList();
        }
    });
    
    //USER AREAS LIST
    $scope.getUserAreasList = function(){
        $scope.tableLoading = true;
        spatialRestService.getUserDefinedAreas().then(function(response){
            $scope.userAreasList = response;
            $scope.displayedUserAreas = [].concat($scope.userAreasList);
            $scope.tableLoading = false;
        }, function(error){
            $scope.tableLoading = false;
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_list');
            $scope.alert.hideAlert();
        });
    };
    
    //USER AREAS TRANSPARENCY
    $scope.formatTooltip = function (value) {
        return value + '%';
    };
    
    $scope.setTransparency = function(value, event){
        areaMapService.setLayerOpacity('USERAREA', (100 - value) / 100);
    };
    
    //Table buttons
    //Zoom
    $scope.zoomToArea = function(idx){
        //Zoom to area
        var wkt = new ol.format.WKT();
        var geom = wkt.readGeometry($scope.displayedUserAreas[idx].extent, {
            dataProjection: 'EPSG:4326',
            featureProjection: areaMapService.getMapProjectionCode()
        });
        areaMapService.zoomToGeom(geom);
        
        //Filter wms layer
        areaMapService.mergeParamsGid($scope.displayedUserAreas[idx].gid, $scope.displayedUserAreas[idx].areaType, true);
    };
    
    //Get area details
    $scope.getAreaDetails = function(idx){
        $scope.alert.setLoading(locale.getString('areas.getting_area'));
        areaRestService.getUserAreaAsJSON($scope.displayedUserAreas[idx].gid).then(function(response){
            $scope.alert.removeLoading();
            $scope.openAreaDetailsModal(response);
        }, function(error){
            $scope.alert.removeLoading();
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_geojson');
            $scope.alert.hideAlert();
        });
    };
    
    //Delete
    $scope.deleteUserArea = function(idx){
        $scope.alert.setLoading(locale.getString('areas.deleting_area'));
        areaRestService.deleteUserArea($scope.displayedUserAreas[idx].gid, idx).then(function(response){
            var targetIdx = $scope.userAreasList.indexOf($scope.displayedUserAreas[idx]);
            $scope.userAreasList.splice(targetIdx, 1);
            areaMapService.refreshWMSLayer('USERAREA');
            $scope.alert.removeLoading();
            $scope.alert.setSuccess();
            $scope.alert.alertMessage = locale.getString('areas.delete_user_area_success');
            $scope.alert.hideAlert();
        }, function(error){
            console.log(error);
            $scope.alert.removeLoading();
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.delete_user_area_error');
            $scope.alert.hideAlert();
        });
    };
    
    

    //Edit user area
    $scope.editUserArea = function(idx){
        $scope.alert.setLoading(locale.getString('areas.getting_area'));
        $scope.getAreaTypes();
        areaRestService.getUserAreaAsGeoJSON($scope.displayedUserAreas[idx].gid).then(function(response){
            $scope.alert.removeLoading();
            $scope.setEditingType('edit');
            $scope.loadGeoJSONFeature(response[0]);
            areaMapService.mergeParamsGid($scope.displayedUserAreas[idx].gid, $scope.displayedUserAreas[idx].areaType, false);
            $scope.isUpdate = true;
        }, function(error){
            console.log(error);
            $scope.alert.removeLoading();
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_geojson');
            $scope.alert.hideAlert();
        });
    };
    
    //Convert geojson area to our user area model
    $scope.loadGeoJSONFeature = function(data){
        $scope.userArea.setPropertiesFromJson(data.properties);
        
        var format = new ol.format.GeoJSON();
        var multiGeom = format.readGeometry(data.geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: areaMapService.getMapProjectionCode()
        });
        
        var geom = multiGeom.getPolygon(0);
        $scope.userArea.geometry = geom;
        $scope.userArea.setCoordsFromGeom();
        $scope.userArea.coordsProj = areaMapService.getMapProjectionCode();
        
        areaMapService.zoomToGeom(geom);
        areaMapService.raiseLayer('drawlayer');
        areaMapService.raiseLayer('pointdraw');
        areaMapService.addVectorFeature(geom);
    };
    
    //CREATE NEW AREA
    $scope.createNewArea = function(){
    	$scope.getAreaTypes();
        $scope.userArea.reset();
        $scope.isUpdate = false;
        $scope.setEditingType('edit');
        areaMapService.raiseLayer('drawlayer');
        areaMapService.raiseLayer('pointdraw');
        areaMapService.clearParams('USERAREA');
        if (!angular.isDefined($scope.selectedProj)){
            $scope.setMapProjectionOnCombo('selectedProj');
        }
        if (!angular.isDefined($scope.selectedCircularProj)){
            $scope.setMapProjectionOnCombo('selectedCircularProj');
        }
    }; 
    
    //COMBOBOX PROJECTION
    $scope.getProjections = function(){
        if ($scope.projections.items.length === 0){
            $scope.projections.getProjections();
        }
    };
    
    //Set map projection as default item on the combobox
    $scope.setMapProjectionOnCombo = function(projProp){
        var mapProj = areaMapService.getMapProjectionCode();
        $scope[projProp] = $scope.projections.getProjectionIdByEpsg(mapProj); 
    };
    
    //PROJECTION LISTENER
    $scope.changeProjection = function(newVal){
        $scope.selectedProj = newVal;
        var selProj = 'EPSG:' + $scope.projections.getProjectionEpsgById(newVal);
        if (newVal !== $scope.lastSelectedProj && selProj !== $scope.userArea.coordsProj && $scope.lastSelectedProj !== undefined){
            $scope.warpCoords(selProj);
        }
        $scope.lastSelectedProj = angular.copy(newVal);
    };
    
    $scope.changeCircularProj = function(newVal){
        if (!angular.isDefined($scope.lastSelectedCentroidProj)){
            var proj = areaMapService.getMapProjectionCode();
            $scope.lastSelectedCentroidProj = $scope.projections.getProjectionIdByEpsg(proj);
            $scope.userArea.centroidProj = proj;
        }
        
        $scope.selectedCircularProj = newVal;
        var selProj = 'EPSG:' + $scope.projections.getProjectionEpsgById(newVal);
        if (newVal !== $scope.lastSelectedCentroidProj && selProj !== $scope.userArea.centroidProj && $scope.lastSelectedCentroidProj !== undefined){
            $scope.warpCentroid(selProj);
        }
        $scope.lastSelectedCentroidProj = angular.copy(newVal);
    };
    
    $scope.$watch('coordVisible', function(newVal, oldVal){
        var selProj = $scope.projections.getProjectionEpsgById($scope.selectedProj);
        var proj;
        if (!angular.isDefined(selProj)){
            proj = areaMapService.getMapProjectionCode();
        } else {
            proj =  'EPSG:' + selProj;
        }
        if (newVal && proj !== $scope.userArea.coordsProj){
            $scope.warpCoords(proj);
        } 
    });
    
    //COMBOBOX AREA TYPES
    $scope.getAreaTypes = function(){
        areaRestService.getUserAreaTypes().then(function(response){
            var types = [];
            for (var i = 0; i < response.length; i++){
                types.push({
                	"code": i,
                    "text": response[i]
                });
            }
            angular.copy(types,$scope.areaTypes);
        }, function(error){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_userarea_types');
            $scope.alert.hideAlert();
        });
    };
    
    //FORM FUNCTIONS
    $scope.buildGeoJSON = function(){
        var geojson = new ol.format.GeoJSON();
        var geom = new ol.geom.MultiPolygon();
        geom.appendPolygon($scope.userArea.geometry);
        
        var feature = new ol.Feature({
            geometry: geom
        });
        
        feature.set('name', $scope.userArea.name);
        feature.set('description', $scope.userArea.desc);
        feature.set('subType', $scope.userArea.subType);
        
        feature.set('startDate', unitConversionService.date.convertDate($scope.userArea.startDate, 'to_server'));
        feature.set('endDate', unitConversionService.date.convertDate($scope.userArea.endDate, 'to_server'));
        feature.set('scopeSelection', $scope.userArea.scopeSelection);
        feature.set('datasetName', $scope.userArea.datasetName);
        
        if (angular.isDefined($scope.userArea.id)){
            feature.set('id', $scope.userArea.id.toString());
        }
        
        var featObj = geojson.writeFeatureObject(feature, {
            dataProjection: 'EPSG:4326',
            featureProjection: areaMapService.getMapProjectionCode()
        });
        
        return featObj;
    };
    
    //Coordinates add coords button
    $scope.addCoordRow = function(){
        $scope.userArea.coordsArray.push([0,0]);
    };
    
    //Coordinates delete coords button
    $scope.deleteCoordRow = function(idx){
        if ($scope.userArea.coordsArray.length > 3){
            $scope.userArea.coordsArray.splice(idx, 1);
        } else {
            $scope.alert.hasAlert = true;
            $scope.alert.hasWarning = true;
            $scope.alert.alertMessage = locale.getString('areas.polygon_min_number_points');
            $scope.alert.hideAlert();
        }
        
    };
    
    //Coordinates reset button
    $scope.resetGeometry = function(){
        $scope.userArea.resetGeometry();
        areaMapService.removeVectorFeatures('drawlayer');
    };
    
    //Circular polygon reset centroid
    $scope.resetCentroid = function(){
        $scope.resetGeometry();
        $scope.userArea.resetCentroid();
        areaMapService.removeVectorFeatures('pointdraw');
        areaMapService.removeVectorFeatures('drawlayer');
        $scope.bufferRadius = undefined;
    };
    
    //Coordinates apply button
    $scope.buildGeometry = function(){
        if ($scope.coordsForm.$valid){
            if ($scope.userArea.coordsArray.length >= 3){
                var coords = [].concat($scope.userArea.coordsArray);
                coords.push($scope.userArea.coordsArray[0]);
                var status = areaMapService.addVectorFeatureFromCoords(coords, $scope.userArea.coordsProj, true);
                if (status === false){
                    $scope.alert.setError();
                    $scope.alert.alertMessage = locale.getString('areas.error_coords_form_invalid_polygon');
                    $scope.alert.hideAlert();
                    angular.element('.area-form-container')[0].scrollTop = 0;
                }
            }
        } else {
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_coords_form');
            $scope.alert.hideAlert();
            angular.element('.area-form-container')[0].scrollTop = 0;
        }
    };
    
    //Convert coordinates from
    $scope.warpCoords = function(to){
        var newCoords = [];
        if (to !== $scope.userArea.coordsProj){
            if (to !== areaMapService.getMapProjectionCode()){
                for (var i = 0; i < $scope.userArea.coordsArray.length; i++){
                    var tempCoord = ol.proj.transform($scope.userArea.coordsArray[i], $scope.userArea.coordsProj, to);
                    newCoords.push(tempCoord);
                }
            } else {
                if (angular.isDefined($scope.userArea.geometry)){
                    newCoords = $scope.userArea.geometry.getCoordinates()[0];
                    newCoords.pop();
                }
            }
        }
        $scope.userArea.coordsArray = [].concat(newCoords);
        $scope.userArea.coordsProj = to;
    };
    
    //Convert centroid coordinates
    $scope.warpCentroid = function(to){
        var newCoords;
        if (to !== $scope.userArea.centroidProj){
            newCoords = ol.proj.transform($scope.userArea.centroidCoords, $scope.userArea.centroidProj, to);
        }
        $scope.userArea.centroidCoords = newCoords;
        $scope.userArea.centroidProj = to;
    };
    
    //Global reset button
    $scope.resetFeature = function(){
        $scope.init();
        $scope.userAreaForm.$setPristine();
        $scope.circularForm.$setPristine();
        areaMapService.removeVectorFeatures('drawlayer');
        areaMapService.removeVectorFeatures('pointdraw');
    };
    
    //Validate if geometry exists and is equal to coords array
    $scope.validateGeometry = function(){
        $scope.userAreaForm.$setValidity('geomError', false);
        if ($scope.userArea.coordsArray.length === 0 && !angular.isDefined($scope.userArea.geometry)){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.null_geom');
        } else if ($scope.userArea.coordsArray.length >= 3 && angular.isDefined($scope.userArea.geometry)){
            if ($scope.coordsForm.$invalid){
                $scope.alert.setError();
                $scope.alert.alertMessage = locale.getString('areas.error_coords_form');
            } else {
                var geomArray = $scope.userArea.geometry.getCoordinates();
                if (geomArray[0].length === 0){
                    $scope.alert.setError();
                    $scope.alert.alertMessage = locale.getString('areas.error_empty_geom');
                } else {
                    geomArray[0].pop();
                    
                    //Build geom from coords array and back for warping purposes
                    var newCoords = [].concat($scope.userArea.coordsArray);
                    newCoords.push($scope.userArea.coordsArray[0]);
                    var coordsGeom = new ol.geom.Polygon();
                    coordsGeom.setCoordinates([newCoords]);
                    
                    if ($scope.userArea.coordsProj !== areaMapService.getMapProjectionCode()){
                        coordsGeom.transform($scope.userArea.coordsProj, areaMapService.getMapProjectionCode());
                    }
                    
                    var finalCoords = coordsGeom.getCoordinates();
                    finalCoords[0].pop();
                    
                    //Now let's compare the arrays with coordinates
                    var diff = _.difference(_.flatten(geomArray[0]), _.flatten(finalCoords[0]));
                    if (diff.length > 0){
                        $scope.openGeomConfirmationModal();
                    } else {
                        $scope.userAreaForm.$setValidity('geomError', true);
                    }
                }
            }
        } else {
            $scope.userAreaForm.$setValidity('geomError', true);
        }
    };
    
    //CONFIRMATION MODAL ON WHICH GEOMETRY TO USE
    $scope.openGeomConfirmationModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/areas/areaManagementModal/areaManagementModal.html',
            controller: 'AreamanagementmodalCtrl',
            size: 'md'
        });
        
        modalInstance.result.then(function(geomType){
           //Type can be map or coord
           if (geomType === 'map'){
               $scope.userAreaForm.$setValidity('geomError', true);
               $scope.userArea.setCoordsFromGeom();
           } else {
               $scope.userAreaForm.$setValidity('geomError', true);
               $scope.buildGeometry();
           }
           $scope.saveFeature();
        });
    };
    
    //Import geometry modal
    $scope.importArea = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partial/areas/uploadAreaModal/uploadAreaModal.html',
            controller: 'UploadareamodalCtrl',
            size: 'md',
            resolve: {
                srcProjections: function(){
                    return $scope.srcProjections;
                },
                defaultProjection: function(){
                    var epsg = areaMapService.getMapProjectionCode();
                    return [$scope.projections.getProjectionIdByEpsg(epsg), epsg];
                }
            }
        });
        
        modalInstance.result.then(function(geom){
            areaMapService.addVectorFeature(geom, true);
            
            var mapProj = areaMapService.getMapProjectionCode();
            var selProj = 'EPSG:' +  projectionService.getProjectionEpsgById($scope.selectedProj);
            if ($scope.activeTool === 'coord' && selProj !== mapProj){
                var clone = geom.clone(); 
                clone.transform(mapProj, selProj);
                $scope.userArea.setCoordsFromObj(clone);
                $scope.userArea.coordsProj = selProj;
            } else {
                $scope.userArea.setCoordsFromGeom();
                $scope.userArea.coordsProj = mapProj;
            }
        });
    };
    
    //Area details modal
    $scope.openAreaDetailsModal = function(data){
        var modalInstance = $modal.open({
           templateUrl: 'partial/areas/areaDetails/areaDetails.html',
           controller: 'AreadetailsCtrl',
           size: 'md',
           resolve: {
               areaData: function(){
                   return data;
               },
               scopesAllowed: function(){
                   return $scope.isUserAllowed('SHARE_USER_DEFINED_AREAS');
               },
               datasetAllowed: function(){
                   return $scope.isUserAllowed('CREATE_USER_AREA_DATASET');
               }
           }
        });
    };
    
    //Get centroid coordinates in WGS and Map projection
    $scope.getMultiProjCentroidCoords = function(){
        var finalCoords = {
            inMapProj: $scope.userArea.centroidCoords,
            inWgs:  $scope.userArea.centroidCoords
        };
        
        if ($scope.userArea.centroidProj !== 'EPSG:4326'){
            finalCoords.inWgs = ol.proj.transform(finalCoords.inWgs, $scope.userArea.centroidProj, 'EPSG:4326');
        }
        
        if ($scope.userArea.centroidProj !== areaMapService.getMapProjectionCode()){
            finalCoords.inMapProj = ol.proj.transform(finalCoords.inMapProj, $scope.userArea.centroidProj, areaMapService.getMapProjectionCode());
        }
        
        return finalCoords;
    };
    
    //Compute the buffer
    $scope.calculateBuffer = function(){
        if ($scope.circularForm.$valid){
            if (!angular.isDefined($scope.userArea.centroidProj)){
                $scope.userArea.centroidProj = areaMapService.getMapProjectionCode();
            }
            
            var coords = $scope.getMultiProjCentroidCoords();
            
            var src = areaMapService.getLayerByType('pointdraw').getSource();
            var feature;
            if (src.getFeatures().length === 0){
                feature = new ol.Feature(
                    new ol.geom.Point(coords.inMapProj)
                );
                src.addFeature(feature);
            } else {
                feature = src.getFeatures()[0];
                feature.getGeometry().setCoordinates(coords.inMapProj);
            }
            
            //Get the distance in meters
            var dist = $scope.bufferRadius;
            if ($scope.selectedUnit === 'nm'){
                dist = unitConversionService.distance.nmToKm($scope.bufferRadius) * 1000;
            } else if ($scope.selectedUnit === 'mi'){
                dist = unitConversionService.distance.miToKm($scope.bufferRadius) * 1000;
            }
            
            //Finally compute the buffer
            var pt = areaMapService.pointCoordsToTurf(coords.inWgs);
            var buffer = turf.buffer(pt, dist, 'meters');
            
            var bufferGeom = areaMapService.turfToOlGeom(buffer);
            areaMapService.addVectorFeature(bufferGeom, true);
            $scope.userArea.setCoordsFromGeom();
            $scope.userArea.coordsProj = areaMapService.getMapProjectionCode();
        }
    };
    
    //Global save button
    $scope.saveFeature = function(mode){
        $scope.userAreaSubmitted = true;
        $scope.validateGeometry();
        if ($scope.userAreaForm.$valid && $scope.coordsForm.$valid){
            var feature = $scope.buildGeoJSON();
            if (mode === 'create'){
                $scope.alert.setLoading(locale.getString('areas.saving_new_area'));
                areaRestService.createUserArea(angular.toJson(feature)).then(function(response) {
                    createSuccess(response, 'areas.create_user_area_success');
                }, function(error) {
                    createError(error, 'areas.crud_user_area_error');
                });
            } else {
                $scope.alert.setLoading(locale.getString('areas.updating_area'));
                areaRestService.updateUserArea(angular.toJson(feature)).then(function(response) {
                    createSuccess(response, 'areas.update_user_area_success');
                }, function(error) {
                    createError(error, 'areas.error_saving_user_area');
                });
            }
            
        } else {
            if (!_.has($scope.userAreaForm.$error, 'geomError')){
                $scope.alert.setError();
                $scope.alert.alertMessage = locale.getString('areas.user_area_form_errors');
            }
            $scope.alert.hideAlert();
        }
    };
    
    //Global cancel button
    $scope.cancelEditing = function(){
        if (angular.isDefined($scope.activeTool)){
            var fn = 'deactivate' + $scope.activeTool.charAt(0).toUpperCase() + $scope.activeTool.substr(1);
            $scope[fn]();
            $scope.activeTool = undefined;
        }
        
        $scope.setEditingType('list');
        $scope.resetFeature();
        if ($scope.isUpdate === true){
            areaMapService.clearParams('USERAREA');
        }
        areaMapService.setLayerOpacity('USERAREA');
        $scope.userAreaTransp = 0;
    };
    
    //CALLBACK FUNCTIONS
    var createSuccess = function(response, successMsg){      
        $scope.alert.removeLoading();
        $scope.alert.setSuccess();
        $scope.alert.alertMessage = locale.getString(successMsg);
        $scope.alert.hideAlert();
        
        //clear vector data
        $scope.resetFeature();
        
        //reload wms and table
        areaMapService.clearParams('USERAREA');
        $scope.getUserAreasList();
        $scope.setEditingType('list');
        $scope.activeTool = undefined;
    };
    
    var createError = function(error, defaultMsg){
        console.log(error);
        $scope.alert.removeLoading();
        $scope.alert.setError();

        if (angular.isDefined(error.data.msg)) {
            $scope.alert.alertMessage = locale.getString('areas.' + error.data.msg);    
        } else {
            $scope.alert.alertMessage = locale.getString(defaultMsg);
        }
        
        $scope.alert.hideAlert();
        
        $scope.userAreaSubmitted = false;
    };

    $scope.isUserAllowed = function(requiredFeature) {
        var isAllowed = false;

        if (angular.isDefined($scope.currentContext.role.features)) {
            var features = $scope.currentContext.role.features.slice(0);
            var discoveredFeature = features.find(function(feature){return feature.featureName === requiredFeature;});

           if (angular.isDefined(discoveredFeature)) {
               isAllowed = true;
           }
        }

        return isAllowed;
    };
    
});