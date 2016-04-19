angular.module('unionvmsWeb').controller('MapCtrl',function($log, $scope, locale, $timeout, $document, $templateRequest, mapService, spatialHelperService, reportService, mapFishPrintRestService, MapFish, MapFishPayload, spatialRestService, $window, projectionService){
    $scope.activeControl = '';
    $scope.showMeasureConfigWin = false;
    $scope.showMapFishConfigWin = false;
    $scope.winExpanded = true;
    $scope.measureConfigs = spatialHelperService.measure;
    $scope.mapFish = MapFish;
    $scope.tbControl = spatialHelperService.tbControl;
    $scope.refresh = reportService.refresh;
    $scope.mapFishLocalConfig = {};
    //$scope.popupSegments = mapService.popupSegRecContainer;
    $scope.popupRecContainer = {};
    $scope.bookmarksByPage = 3;
    $scope.bookmarkNew = {};
    $scope.submitingBookmark = false;
    $scope.isAddBookVisible = false;
    $scope.submittedMapFishPrint = false;
    $scope.isRequestingImage = false;
    $scope.projections = projectionService;
    $scope.graticuleActivated = false;
    $scope.graticuleTip = [locale.getString('spatial.map_tip_enable'), locale.getString('spatial.map_tip_graticule')].join(' ');
    
    //Comboboxes
    $scope.measuringUnits = [];
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_meters'), "code": "m"});
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_nautical_miles'), "code": "nm"});
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_miles'), "code": "mi"});

    $scope.exportFormats = [];
    $scope.exportFormats.push({"text": 'PNG', "code": "png"});
    $scope.exportFormats.push({"text": 'JPEG', "code": "jpeg"});
    $scope.exportFormats.push({"text": 'PDF', "code": "pdf"});

    $scope.printLayouts = [];
    $scope.printLayouts.push({"text": locale.getString('spatial.map_export_layout_portrait'), "code": "portrait"});
    $scope.printLayouts.push({"text": locale.getString('spatial.map_export_layout_landscape'), "code": "landscape"});
    
    //Close identify popup
    $scope.closePopup = function(){
        mapService.closePopup();
    };
    
    //Change displayed record on popup - vms segments only
    $scope.changeDisplayedRecord = function(direction){
        if (direction === 'next' && $scope.popupRecContainer.currentIdx < $scope.popupRecContainer.records.length - 1){
            $scope.popupRecContainer.currentIdx += 1;
            $scope.updatePopup();
        } else if (direction === 'previous' && $scope.popupRecContainer.currentIdx > 0){
            $scope.popupRecContainer.currentIdx -= 1;
            $scope.updatePopup();
        }
    };
    
    //Watch to change the source for the popup paginator
    $scope.$watch(function(){return mapService.activeLayerType;}, function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            if (newVal === 'vmsseg'){
                $scope.popupRecContainer = mapService.popupSegRecContainer;
            } else if (newVal === 'alarms'){
                $scope.popupRecContainer = mapService.popupAlarmRecContainer;
            }
        }
    });
    
    //Check for permissions
    $scope.checkSpatialConfigPermission = function(){
        var userPref = $scope.isAllowed('Spatial', 'ALLOW_USER_SPATIAL_CONFIGURATIONS');
        var repPref = $scope.isAllowed('Spatial', 'ALLOW_USER_SPATIAL_REPORT_CONFIGURATIONS');
        
        if (userPref || repPref){
            return true;
        }
        return false;
    };
    
    //Update popup content
    $scope.updatePopup = function(){
        var record, data;
        if (mapService.activeLayerType === 'vmsseg'){
            record = mapService.popupSegRecContainer.records[mapService.popupSegRecContainer.currentIdx];
            data = mapService.setSegmentsObjPopup(record.data);
        } else if (mapService.activeLayerType === 'alarms'){
            record = mapService.popupAlarmRecContainer.records[mapService.popupAlarmRecContainer.currentIdx];
            data = mapService.setAlarmsObjPopup(record.data);
        }
        mapService.requestPopupTemplate(data, record.coord, record.fromCluster, true);
    };
    
    //Projections
    $scope.setDefaultPrintProjection = function(){
        var mapProj = mapService.getMapProjectionCode();
        $scope.mapFish.projectionId = $scope.projections.getProjectionIdByEpsg(mapProj);
    };
    
    //MAPFISH STUFF
    //Initialization
    (function () {
        $log.debug("Init MapCtrl");
        MapFish.reset();
        mapFishPrintRestService.ping().then(
            function (data) {
                $log.debug(data);
                MapFish.isDeployed = true;
                $scope.projections.getProjections();
                $scope.getTemplates();
                $scope.getCapabilities('default');
            }, function(error) {
                $log.error(error);
                MapFish.isDeployed = false;
            }
        );
    })();
    
    //Get printing templates
    $scope.getTemplates = function(){
        $log.debug("Fetching mapfish templates from server");
        MapFish.reset();
        mapFishPrintRestService.getTemplates().then(
            function (data) {
                $log.debug(data);
                MapFish.initTemplateCmbx(data);
            }, function(error) {
                $log.error(error);
            }
        );
    };
    
    $scope.changeTemplate = function (selected_template) {
        $log.debug("Changing template to " + selected_template);
        $scope.getCapabilities(selected_template);
    };

    //Get capabilities from print server
    $scope.getCapabilities = function(appId){
        $log.debug("Getting capabilities of " + appId);
        MapFish.reset();
        mapFishPrintRestService.getCapabilities(appId).then(
            function (data) {
                $log.debug(data);
                MapFish.initFormatsCmbx(data);
                MapFish.initLayoutCmbx(data);
                MapFish.initLayoutAttributes(data, MapFish.layouts[0].text);
                if ($scope.showMapFishConfigWin === true){
                    mapService.addPrintExtent();
                }
            }, function(error) {
                $log.error(error);
            }
        );
    };
    
    //Toggle MapFish layouts
    $scope.toggleLayout = function(selectedLayout) {
        $log.debug("Layout changed to " + selectedLayout);
        MapFish.resetOnLayoutChange();
        $scope.mapFishLocalConfig = {};
        MapFish.initLayoutAttributes(MapFish.capabilitiesData, selectedLayout);
        mapService.addPrintExtent();
    };
    
    //Activate Mapfish
    $scope.mapFishPrintEnable = function(){
        mapService.addPrintLayer();
        mapService.addDragPrintExtent();
        $scope.openMapFishConfigWin();
        if (!angular.isDefined($scope.mapFish.projectionId)){
            $scope.setDefaultPrintProjection();
        }
    };
    
    $scope.openMapFishConfigWin = function(){
        $scope.showMapFishConfigWin = true;
        $scope.submittedMapFishPrint = false;
        $scope.mapForm.printForm.$setPristine();
        var win = angular.element('#map-fish-print-config');
        var btnPos = angular.element('#map-fish-print-config-btn').offset();
        $scope.setWinDraggable(win, btnPos);
        mapService.addPrintExtent();
    };
    
    //Deactivate Mapfish
    $scope.mapFishPrintDisable = function(){
        $scope.showMapFishConfigWin = false;
        var layer = mapService.getLayerByType('print');
        if (angular.isDefined(layer)){
            mapService.map.removeLayer(layer);
            mapService.map.removeInteraction(mapService.getCustomInteraction('Pointer', 'dragExtent')[0]);
        }
        var mapEl = mapService.map.getTargetElement();
        mapEl.style.cursor = 'default';
    };
    
    //Cancel print job
    $scope.cancelPrint = function (ref){
        if (ref === undefined) {
            return;
        }
        mapFishPrintRestService.cancelPrintJob(ref).then(
            function(data){
                $log.debug(data);
            },function(error){
                $log.error(error);
            }
        );
    };

    //Prepare print request
    $scope.printMapWithMapFish = function(ref) {
    	$scope.submittedMapFishPrint = true;
    	if($scope.mapForm.printForm.$valid){
	    	if($scope.mapFish.jobStatusData.status === 'running'){
	    		if (ref === undefined) {
	                return;
	            }
	            mapFishPrintRestService.cancelPrintJob(ref).then(
	                function(data){
	                    $log.debug(data);
	                    $scope.isRequestingImage = false;
	                },function(error){
	                    $log.error(error);
	                    $scope.isRequestingImage = false;
	                }
	            );
	    	}else{
		        $log.debug("Requesting print job");
		        
		        var payload = new MapFishPayload();
		        
		        var positions = payload.getIconPayload('positions');
		        var segments = payload.getIconPayload('segments');
		        var alarms = payload.getIconPayload('alarms');
		        
		        $scope.isRequestingImage = true;
		        
		        var iconPayload = {};
		        if (angular.isDefined(positions) && angular.isDefined(mapService.getLayerByType('vmspos')) && mapService.getLayerByType('vmspos').get('visible')){
		            iconPayload.positions = positions;
		        }
		        
		        if (angular.isDefined(segments) && angular.isDefined(mapService.getLayerByType('vmsseg')) && mapService.getLayerByType('vmsseg').get('visible')){
                    iconPayload.segments = segments;
                }
		        
		        if (angular.isDefined(alarms) && angular.isDefined(mapService.getLayerByType('alarms')) && mapService.getLayerByType('alarms').get('visible')){
                    iconPayload.alarms = alarms;
                }
		        
		        //prepare the payload to get icons and legends from our web service
		        if (!_.isEqual({}, iconPayload)){
		            //call icon and legends rest api and only go on if we receive a correct payload
		            mapFishPrintRestService.getIconAndLegends(iconPayload).then(function(response){
		                payload.createPayloadObj($scope.mapFishLocalConfig, response);
		                $scope.doPrintRequest(payload);
		            }, function(error){
		                return undefined;
		            });
		        } else {
		            payload.createPayloadObj($scope.mapFishLocalConfig);
		            $scope.doPrintRequest(payload);
		        }
	    	}
    	}
    };
    
    //Do the actual print
    $scope.doPrintRequest = function(payload){
        mapFishPrintRestService.createPrintJob(MapFish.selected_template, MapFish.selected_format, payload).then(
            function(data) {
                $log.debug(data);
                MapFish.printJobData = data;
                var poller = function() {
                    if(MapFish.printJobData !== undefined){
                        mapFishPrintRestService.getPrintJobStatus(MapFish.printJobData.ref).then(
                            function(data){
                                $log.debug(data);
                                MapFish.jobStatusData = data;
                                if (MapFish.jobStatusData.status === 'running' || MapFish.jobStatusData.status === 'waiting'){
                                    $timeout(poller, 1000);
                                }
                                if(MapFish.jobStatusData.status === 'finished'){
                                   $scope.download(MapFish.jobStatusData.downloadURL);
                                   $scope.isRequestingImage = false;
                                }
                                if(MapFish.jobStatusData.status === 'error'){
                                    $scope.isRequestingImage = false;
                                }
                            },function (error) {
                                $log.error(error);
                                $scope.isRequestingImage = false;
                            }
                        );
                    }
                };
                poller();
            },function (error) {
                $log.error(error);
                $scope.isRequestingImage = false;
            }
        );
    };

    //Download printed map
    $scope.download = function(downloadURL){
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('target', '_blank');
        downloadLink.attr('download', 'uvms');
        downloadLink.attr('href', downloadURL);
        $document.find('body').append(downloadLink);
        $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
        }, null);
    };
    
    //Handle toggle on top toolbar
    $scope.toggleToolbarBtn = function(tool){
        var fn;
        var previousControl = $scope.activeControl;

        $scope.winExpanded = true;
        if (tool !== previousControl && previousControl !== ''){
            fn = previousControl + 'Disable';
            $scope.activeControl = tool;
            $scope[fn]();
        } else if (tool === previousControl){
            fn = previousControl + 'Disable';
            $scope.activeControl = '';
            $scope[fn]();
        } else {
            $scope.activeControl = tool;
        }

        if ($scope.activeControl !== ''){
            fn = $scope.activeControl + 'Enable';
            $scope[fn]();
        }
    };

    //Setup draggable windows
    $scope.setWinDraggable = function(win, buttonPosition){
        if (win.draggable('instance') === undefined){
            win.draggable({
                handle: 'span.fa-bullseye',
                containment: '.map-container',
                scroll: false
            });
        }
        var mapEl = mapService.map.getTargetElement();
        var mapRect = mapEl.getBoundingClientRect();
        win[0].style.marginTop = '8px';
        win[0].style.top = 'auto';
        win[0].style.left = buttonPosition.left + 'px';
    };
    
    //Expand or collapse draggable windows
    $scope.toggleWinStatus = function(){
        $scope.winExpanded = !$scope.winExpanded; 
    };

    //Measure control
    $scope.measureEnable = function(){
        $scope.openMeasureConfigWin();
        mapService.startMeasureControl();
    };

    $scope.openMeasureConfigWin = function(){
        $scope.showMeasureConfigWin = true;
        var win = angular.element('#measure-config');
        var btnPos = angular.element('#measure-config-btn').offset();
        $scope.setWinDraggable(win, btnPos);
    };

    $scope.measureDisable = function(){
        $scope.showMeasureConfigWin = false;
        mapService.clearMeasureControl();
        $scope.measureConfigs.units = 'm';
        $scope.measureConfigs.speed = undefined;
        $scope.measureConfigs.startDate = undefined;
        $scope.measureConfigs.disabled = false;
    };

    //Map graticule
    $scope.toggleGraticule = function(){
        $scope.graticuleActivated = !$scope.graticuleActivated;
        mapService.setGraticule($scope.graticuleActivated);
        var firstTitle = locale.getString('spatial.map_tip_enable');
        if ($scope.graticuleActivated){
            firstTitle = locale.getString('spatial.map_tip_disable');
        }
        $scope.graticuleTip = [firstTitle, locale.getString('spatial.map_tip_graticule')].join(' ');
    };
    
    //Fetch alarms
    $scope.getAlarms = function(){
        reportService.getAlarms();
    };
    
    //Bookmarks control
    $scope.bookmarksEnable = function(){
    	spatialRestService.getBookmarkList().then(bookmarkListSuccess,bookmarkListError);
    	$scope.openBookmarksWin();
    };

    $scope.openBookmarksWin = function(){
    	$scope.searchBookmark = undefined;
        $scope.showBookmarksWin = true;
        var win = angular.element('#bookmarks');
        var btnPos = angular.element('#bookmarks-btn').offset();
        $scope.setWinDraggable(win, btnPos);
    };

    $scope.bookmarksDisable = function(){
        $scope.showBookmarksWin = false;
    };
    
    var bookmarkListSuccess = function(data){
    	$scope.bookmarks = data;
    	$scope.displayedBookmarks = [].concat($scope.bookmarks);
    };
    
    var bookmarkListError = function(error){
        $log.error(error);
    };
    
    $scope.removeBookmark = function(id){
    	spatialRestService.deleteBookmark(id).then(deleteBookmarkSuccess,deleteBookmarkError);
    };

    var deleteBookmarkSuccess = function(data){
    	for(var i = 0;i<$scope.bookmarks.length;i++){
    		if($scope.bookmarks[i].id === data.id){
    			$scope.bookmarks.splice(i, 1);
    		}
    	}
    };
    
    var deleteBookmarkError = function(error){
        $log.error(error);
    };
    
    $scope.showBookmarkOnMap = function(bookmark) {
    	var srs = 'EPSG:' + bookmark.srs;
    	var extent = bookmark.extent.split(';');
    	var finalExtent = [];
    	
    	for (var i = 0; i < extent.length; i++){
    		finalExtent.push(parseFloat(extent[i]));
    	}
    	
    	var geom = new ol.geom.Polygon.fromExtent(finalExtent);
    	if(srs !== mapService.getMapProjectionCode()){
    		geom.transform(srs, mapService.getMapProjectionCode());
    	}
        mapService.zoomTo(geom, true);
    };
    
    $scope.createBookmark = function(){
    	$scope.submitingBookmark = true;
    	if($scope.mapForm.bookmarksForm.bookmarkName.$valid){
    		var projectionCode = mapService.getMapProjectionCode();
	    	$scope.bookmarkNew.srs = projectionCode.substr(projectionCode.indexOf(':')+1, projectionCode.length-1);
	    	$scope.bookmarkNew.extent = mapService.map.getView().calculateExtent(mapService.map.getSize()).join().replace(/\,/g,';');
	    	spatialRestService.createBookmark($scope.bookmarkNew).then(createBookmarkSuccess,createBookmarkError);
    	}
    };
    
    var createBookmarkSuccess = function(response){
    	$scope.bookmarks.push(response.data);
    	$scope.submitingBookmark = false;
    	$scope.bookmarkNew.name = undefined;
    	$scope.mapForm.bookmarksForm.$setPristine();
    };
    
    var createBookmarkError = function(error){
        $log.error(error);
    };

    //Refresh report control
    $scope.refreshReport = function () {
        reportService.refreshReport();
    };

    //Clear highlight features control
    $scope.clearMapHighlights = function () {
        var layer = mapService.getLayerByType('highlight');
        if (angular.isDefined(layer)) {
            layer.getSource().clear(true);
        }
    };
    
    $scope.changeRefreshStatus = function() {
	    if ($scope.refresh.status === true) {
	    	reportService.setAutoRefresh();
	    }
    };

    //Untoggle any toolbar btn when tab is changed
    $scope.$on('untoggleToolbarBtns', function (evt) {
        if ($scope.activeControl !== '') {
            $scope.toggleToolbarBtn($scope.activeControl);
        }
    });

    $($window).resize(mapService.updateMapContainerSize);
    $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function() {
    	setTimeout(function() {
    		if($scope.showMeasureConfigWin){
        		$scope.openMeasureConfigWin();
        	}
    		if($scope.showMapFishConfigWin){
    			$scope.openMapFishConfigWin();
    		}
    	}, 100);
	});

    angular.element(document).ready(function () {
        mapService.updateMapContainerSize();
    });

    //Other controls
//    $scope.otherEnable = function(){
//        console.log('enable other');
//    };
//    
//    $scope.otherDisable = function(){
//        console.log('disable other');
//    };
});

//angular.module('unionvmsWeb').controller('MappanelCtrl',function($scope, locale, mapService, spatialHelperService, defaultMapConfigs){
//    locale.ready('spatial').then(function(){
//        if (!angular.isDefined(mapService.map)){
//            mapService.resetLabelContainers();
//            mapService.setMap(defaultMapConfigs);
//            $scope.map = mapService.map;
//            spatialHelperService.setToolbarControls(defaultMapConfigs);
//        }
//    });
//});