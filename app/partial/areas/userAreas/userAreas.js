angular.module('unionvmsWeb').controller('UserareasCtrl',function($scope, locale, $modal, UserArea, areaMapService, areaRestService, areaAlertService, spatialRestService, unitConversionService){
    $scope.activeTool = undefined;
    $scope.selectedProj = undefined;
    $scope.userAreasList = [];
    $scope.displayedUserAreas = [].concat($scope.userAreasList);
    $scope.itemsByPage = 5;
    $scope.tableLoading = false;
    $scope.editingType = 'list';
//    $scope.editingType = 'edit';
    $scope.isUpdate = false;
    $scope.searchString = '';
    $scope.userAreaTransp = 0;
    
    $scope.init = function(){
        $scope.coordVisible = false;
        $scope.userAreaSubmitted = false;
        
        $scope.userArea = UserArea;
        $scope.userArea.reset();
        $scope.displayedCoords = [].concat($scope.userArea.coordsArray);
    };
    
    //Switch editing type
    $scope.setEditingType = function(type){
        if ($scope.editingType === 'edit' && angular.isDefined($scope.activeTool)){
            var fn = 'deactivate' + $scope.activeTool.charAt(0).toUpperCase() + $scope.activeTool.substr(1);
            $scope[fn]();
        }
        $scope.editingType = type;
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
        areaMapService.addDrawControl();
    };
    
    $scope.deactivateDraw = function(){
        areaMapService.removeDrawControl();
    };
    
    $scope.activateEdit = function(){
        areaMapService.addEditControl();
    };
    
    $scope.deactivateEdit = function(){
        areaMapService.removeEditControl();
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
        $scope.init();
        $scope.getProjections();
        $scope.getUserAreaLayer();
        //$scope.getAreaTypes();
        if ($scope.userAreasList.length === 0){
            $scope.getUserAreasList();
        }
    });
    
    //USER AREA LAYER
    $scope.getUserAreaLayer = function(){
        spatialRestService.getUserAreaLayer().then(function(response){
            if (!angular.isDefined(areaMapService.getLayerByType('USERAREA'))){
                areaMapService.addUserAreasWMS(response.data);
            }
        }, function(error){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_layer');
            $scope.alert.hideAlert();
        });
    };
    
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
        areaRestService.getUserAreaAsGeoJSON($scope.displayedUserAreas[idx].gid).then(function(response){
            $scope.alert.removeLoading();
            $scope.setEditingType('edit');
            $scope.loadGeoJSONFeature(response[0]);
            areaMapService.mergeParamsGid($scope.displayedUserAreas[idx].gid, $scope.displayedUserAreas[idx].areaType, false);
            $scope.isUpdate = true;
        }, function(error){
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
        areaMapService.addVectorFeature(geom);
    };
    
    //CREATE NEW AREA
    $scope.createNewArea = function(){
        $scope.isUpdate = false;
        $scope.setEditingType('edit');
        areaMapService.raiseLayer('drawlayer');
        areaMapService.clearParams('USERAREA');
    }; 
    
    //COMBOBOX PROJECTION
    $scope.getProjections = function(){
        spatialRestService.getSupportedProjections().then(function(response){
            $scope.srcProjections = response;
            $scope.projections = [];
            for (var i = 0; i < $scope.srcProjections.length; i++){
                $scope.projections.push({
                    "text": $scope.srcProjections[i].name,
                    "code": $scope.srcProjections[i].id
                });
            }

            $scope.setMapProjectionOnCombo();
            
        }, function(error){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_projections');
            $scope.alert.hideAlert();
        });
    };
    
    //Set map projection as default item on the combobox
    $scope.setMapProjectionOnCombo = function(){
        var mapProj = areaMapService.getMapProjectionCode();
        for (var i = 0; i < $scope.srcProjections.length; i++){
            var projCode = 'EPSG:' + $scope.srcProjections[i].epsgCode;
            if (projCode === mapProj){
                $scope.selectedProj = $scope.srcProjections[i].id;
            }
        }
    };
    
    //Get projection id by EPSG code
    $scope.getProjectionIdByEpsg = function(epsg){
        var epsgCode = epsg;
        if (epsg.indexOf(':') !== -1){
            epsgCode = epsg.split(':')[1];
        }
        
        if (angular.isDefined($scope.srcProjections)){
            for (var i = 0; i < $scope.srcProjections.length; i++){
                if ($scope.srcProjections[i].epsgCode === parseInt(epsgCode)){
                    return $scope.srcProjections[i].id; 
                }
            }
        }
    };
    
    //Get EPSG code by the id of the selected projection
    $scope.getProjectionEpsgById = function(id){
        if (angular.isDefined($scope.srcProjections)){
            for (var i = 0; i < $scope.srcProjections.length; i++){
                if ($scope.srcProjections[i].id === id){
                    return $scope.srcProjections[i].epsgCode; 
                }
            }
        }
    };
    
    //PROJECTION LISTENER
    $scope.$watch('selectedProj', function(newVal, oldVal){
        var selProj = 'EPSG:' + $scope.getProjectionEpsgById(newVal);
        if (newVal !== oldVal && selProj !== $scope.userArea.coordsProj && oldVal !== undefined){
            $scope.warpCoords(selProj);
        }
    });
    
    $scope.$watch('coordVisible', function(newVal, oldVal){
        var proj =  'EPSG:' + $scope.getProjectionEpsgById($scope.selectedProj);
        if (newVal && proj !== $scope.userArea.coordsProj){
            $scope.warpCoords(proj);
        } 
    });
    
    //COMBOBOX PROJECTION
    $scope.getAreaTypes = function(){
        areaRestService.getUserAreaTypes().then(function(response){
            $scope.areaTypes = [];
            for (var i = 0; i < response.length; i++){
                //TODO
//                $scope,areaTypes.push({
//                   "text":  
//                });
            }
            
            //$scope.srcProjections = response;
//            $scope.projections = [];
//            for (var i = 0; i < $scope.srcProjections.length; i++){
//                $scope.projections.push({
//                    "text": $scope.srcProjections[i].name,
//                    "code": $scope.srcProjections[i].id
//                });
//            }
//
//            $scope.setMapProjectionOnCombo();
            
        }, function(error){
//            $scope.alert.setError();
//            $scope.alert.alertMessage = locale.getString('areas.error_getting_projections');
//            $scope.alert.hideAlert();
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
        feature.set('isShared', $scope.userArea.isShared);
        
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
        areaMapService.removeVectorFeatures();
    };
    
    //Coordinates apply button
    $scope.buildGeometry = function(){
        if ($scope.coordsForm.$valid){
            if ($scope.userArea.coordsArray.length >= 3){
                var coords = [].concat($scope.userArea.coordsArray);
                coords.push($scope.userArea.coordsArray[0]);
                areaMapService.addVectorFeatureFromCoords(coords, $scope.userArea.coordsProj, true);
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
                if (angular.isDefined(UserArea.geometry)){
                    newCoords = UserArea.geometry.getCoordinates()[0];
                    newCoords.pop();
                }
            }
        }
        $scope.userArea.coordsArray = [].concat(newCoords);
        $scope.userArea.coordsProj = to;
    };
    
    //Global reset button
    $scope.resetFeature = function(){
        $scope.init();
        $scope.userAreaForm.$setPristine();
        areaMapService.removeVectorFeatures();
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
                projections: function(){
                    return $scope.projections;
                },
                srcProjections: function(){
                    return $scope.srcProjections;
                },
                defaultProjection: function(){
                    var epsg = areaMapService.getMapProjectionCode();
                    return [$scope.getProjectionIdByEpsg(epsg), epsg];
                }
            }
        });
        
        modalInstance.result.then(function(geom){
            areaMapService.addVectorFeature(geom, true); 
            $scope.userArea.setCoordsFromGeom();
            $scope.userArea.coordsProj = areaMapService.getMapProjectionCode();
        });
    };
    
    //Global save button
    $scope.saveFeature = function(mode){
        $scope.userAreaSubmitted = true;
        $scope.validateGeometry();
        if ($scope.userAreaForm.$valid && $scope.coordsForm.$valid){
            var feature = $scope.buildGeoJSON();
            if (mode === 'create'){
                $scope.alert.setLoading(locale.getString('areas.saving_new_area'));
                areaRestService.createUserArea(angular.toJson(feature)).then(createSuccess, createError);
            } else {
                $scope.alert.setLoading(locale.getString('areas.updating_area'));
                areaRestService.updateUserArea(angular.toJson(feature)).then(function(response){
                    $scope.alert.removeLoading();
                    $scope.alert.setSuccess();
                    $scope.alert.alertMessage = locale.getString('areas.update_user_area_success');
                    $scope.alert.hideAlert();
                    
                    //clear vector data
                    $scope.resetFeature();
                    
                    //reload wms and table
                    areaMapService.clearParams('USERAREA');
                    $scope.getUserAreasList();
                    $scope.setEditingType('list');
                    $scope.activeTool = undefined;
                }, function(error){
                    $scope.alert.setError();
                    $scope.alert.alertMessage = locale.getString('areas.error_saving_user_area');
                    $scope.alert.hideAlert();
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
    var createSuccess = function(response){
        $scope.alert.removeLoading();
        $scope.alert.setSuccess();
        $scope.alert.alertMessage = locale.getString('areas.create_user_area_success');
        $scope.alert.hideAlert();
        
        //clear vector data
        $scope.resetFeature();
        
        //reload wms and table
        areaMapService.refreshWMSLayer('USERAREA');
        $scope.getUserAreasList();
        $scope.setEditingType('list');
        $scope.activeTool = undefined;
    };
    
    var createError = function(error){
        console.log(error);
        $scope.alert.removeLoading();
        $scope.alert.setError();
        $scope.alert.alertMessage = locale.getString('areas.crud_user_area_error');
        $scope.alert.hideAlert();
        
        $scope.userAreaSubmitted = false;
    };
    
    
});