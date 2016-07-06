angular.module('unionvmsWeb').controller('MapCtrl',function($log, $scope, locale, $timeout, $document, $templateRequest, $modal, mapService, spatialHelperService, reportService, mapFishPrintRestService, MapFish, MapFishPayload, spatialRestService, $window, projectionService, $state, $localStorage, reportFormService,$compile,comboboxService,userService){
    $scope.activeControl = '';
    $scope.showMeasureConfigWin = false;
    $scope.showMapFishConfigWin = false;
    $scope.showBufferConfigWin = false;
    $scope.showGazetteer = false;
    $scope.winExpanded = true;
    $scope.measureConfigs = spatialHelperService.measure;
    //$scope.bufferConfigs = spatialHelperService.buffer;
    $scope.mapFish = MapFish;
    $scope.tbControl = spatialHelperService.tbControl;
    $scope.refresh = reportService.refresh;
    $scope.mapFishLocalConfig = {};
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
    $scope.infoLayer = undefined;
    $scope.comboServ = comboboxService;

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

    /*$scope.bufferLayers = [];
    $scope.bufferLayers.push({"text": locale.getString('spatial.map_buffer_layers_vmspos'), "code": "vmspos"});
    $scope.bufferLayers.push({"text": locale.getString('spatial.map_buffer_layers_vmsseg'), "code": "vmspos"});
    $scope.bufferLayers.push({"text": locale.getString('spatial.map_buffer_layers_vmstrack'), "code": "vmstrack"});*/

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
            $scope.infoLayer = newVal;
            if (newVal === 'vmsseg'){
                $scope.popupRecContainer = mapService.popupSegRecContainer;
            } else if (newVal === 'alarms'){
                $scope.popupRecContainer = mapService.popupAlarmRecContainer;
            }
        }
    });

    //Get vessel details from within the positions popup
    $scope.getVesselDetails = function(){
        var assetId = mapService.overlay.get('vesselId');
        if (angular.isDefined(assetId)){
            var modalInstance = $modal.open({
                templateUrl: 'partial/spatial/reportsPanel/reportForm/vesselFieldset/detailsModal/detailsModal.html',
                controller: 'DetailsmodalCtrl',
                size: '',
                resolve: {
                    itemForDetail: function(){
                        var item = {
                            type: 'asset',
                            name: mapService.overlay.get('vesselName'),
                            guid: assetId
                        };
                        return item;
                    }
                }
            });
        }


        $scope.viewDetails = function(idx, source){
            var modalInstance = $modal.open({
                templateUrl: 'partial/spatial/reportsPanel/reportForm/vesselFieldset/detailsModal/detailsModal.html',
                controller: 'DetailsmodalCtrl',
                size: '',
                resolve: {
                    itemForDetail: function(){
                        if (source === 'SEARCH'){
                            idx = $scope.shared.vessels.indexOf($scope.displayedRecords[idx]);
                            var item = $scope.shared.vessels[idx];
                            item.type = $scope.shared.vesselSearchBy;
                            if (item.type === 'asset'){
                                item.guid = $scope.shared.vessels[idx].vesselId.guid;
                            }

                            return item;
                        } else {
                            idx = $scope.report.vesselsSelection.indexOf($scope.displayedRecordsSelection[idx]);
                            return $scope.report.vesselsSelection[idx];
                        }
                    }
                }
            });
        };
    };

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
        $scope.isLoadingMapfishPopup = true;
        mapFishPrintRestService.getCapabilities(appId).then(
            function (data) {
                $log.debug(data);
                MapFish.initFormatsCmbx(data);
                MapFish.initLayoutCmbx(data);
                MapFish.initLayoutAttributes(data, MapFish.layouts[0].text);
                if ($scope.showMapFishConfigWin === true){
                    mapService.addPrintExtent();
                }
                $scope.isLoadingMapfishPopup = false;
            }, function(error) {
                $log.error(error);
                $scope.isLoadingMapfishPopup = false;
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
	    	    $scope.cancelPrint(ref);
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
                                    $timeout(poller, 5000);
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
        var xhr = new XMLHttpRequest();
        xhr.open('GET', downloadURL, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Authorization', $localStorage.token);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(){
            if (typeof window.btoa === 'function'){
                if (this.status === 200){
                    var filename = "";
					var disposition = xhr.getResponseHeader('Content-Disposition');
					if (disposition && disposition.indexOf('attachment') !== -1) {
						var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						var matches = filenameRegex.exec(disposition);
						if (matches !== null && matches[1]){filename = matches[1].replace(/['"]/g, '');}
					}
					var type = xhr.getResponseHeader('Content-Type');

					var blob = new Blob([this.response], { type: type });
                    saveAs(blob, filename);
                }
            } 
        };
        xhr.send();
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
                handle: 'span.fa-arrows',
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

    //Buffer control
    /*$scope.bufferEnable = function(){
        $scope.openBufferConfigWin();
    };

    $scope.openBufferConfigWin = function(){
        $scope.showBufferConfigWin = true;
        var win = angular.element('#buffer-config');
        var btnPos = angular.element('#buffer-config-btn').offset();
        $scope.setWinDraggable(win, btnPos);
    };

    $scope.toggleSelectFeatures = function(){
        $scope.bufferConfigs.isSelecting = true;
        mapService.addVmsSelectCtrl();
    };

    $scope.bufferDisable = function(){
        $scope.showBufferConfigWin = false;
    };*/

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

    //Gazetteer control
    $scope.gazetteerEnable = function(){
        $scope.showGazetteer = true;
        $timeout(function(){
            $('.gazetteer-container').find('input').focus();
        }, 50);
    };

    $scope.gazetteerDisable = function(){
        $scope.showGazetteer = false;
        var layer = mapService.getLayerByType('nominatim');
        if (angular.isDefined(layer)){
            mapService.map.removeLayer(layer);
        }
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

    $scope.openMapOnNewTab = function(){
    	var guid = generateGUID();
    	if(reportService.outOfDate){
    		$localStorage['report' + reportService.id + '-' + guid] = angular.copy(reportFormService.report);
    	}
    	var url = $state.href('app.reporting-id', {id: reportService.id, guid: guid});
    	$window.open(url,'_blank');
    };

    $scope.selectHistory = function(item){
        var report = angular.copy(item);
        delete report.code;
        delete report.text;
        reportService.runReport(report);
    };

    $scope.initComboHistory = function(comboId){
        var comboFooter = angular.element('<li class="combo-history-footer"><div class="footer-item"><span>Edit List</span></div><div class="footer-item" ng-click="createReportFromLiveview($event)"><span>Create new</span></div></li>');
        angular.element('#' + comboId + '>.dropdown-menu').append(comboFooter);
        $compile(comboFooter)($scope);
    };

    function generateGUID() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

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


    var response = {"data":[{"id":5,"name":"asd","visibility":"private","createdOn":"2016-07-05T12:47:20","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":6,"name":"aaa","visibility":"private","createdOn":"2016-07-05T12:47:31","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":7,"name":"da","visibility":"private","createdOn":"2016-07-05T12:47:40","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":8,"name":"asdasd","visibility":"private","createdOn":"2016-07-05T12:47:56","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":9,"name":"asdddfd","visibility":"private","createdOn":"2016-07-05T12:48:05","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":10,"name":"aacccc","visibility":"private","createdOn":"2016-07-05T12:48:16","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":11,"name":"vvvvvvvvvv","visibility":"public","createdOn":"2016-07-05T12:48:38","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":12,"name":"gg44","visibility":"public","createdOn":"2016-07-05T12:48:58","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":13,"name":"ppppp","visibility":"public","createdOn":"2016-07-05T12:49:21","executedOn":null,"createdBy":"rep_private","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":14,"name":"ljk58","visibility":"private","createdOn":"2016-07-05T12:49:43","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":15,"name":"poo","visibility":"public","createdOn":"2016-07-05T12:50:01","executedOn":null,"createdBy":"rep_private","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":16,"name":"kknnn","visibility":"public","createdOn":"2016-07-05T12:50:19","executedOn":null,"createdBy":"rep_private","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":17,"name":"pppp","visibility":"public","createdOn":"2016-07-05T12:51:02","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":18,"name":"bnhg","visibility":"public","createdOn":"2016-07-05T12:51:15","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":19,"name":"ppqqq","visibility":"scope","createdOn":"2016-07-05T12:51:31","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":20,"name":"mmm","desc":"aksjdhaskjdhaskjxcncvkjdfhamcnasjjjjjjjjjjjjjjjjjjjj aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","visibility":"scope","createdOn":"2016-07-05T12:52:01","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":21,"name":"bbbbbbbbbbbb","visibility":"scope","createdOn":"2016-07-05T12:52:21","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":22,"name":"jjjdajdsbn","visibility":"scope","createdOn":"2016-07-05T12:52:56","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":23,"name":"tyur","visibility":"scope","createdOn":"2016-07-05T12:53:19","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":24,"name":"ddd","visibility":"scope","createdOn":"2016-07-05T12:55:09","executedOn":null,"createdBy":"rep_private","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":25,"name":"fff","visibility":"scope","createdOn":"2016-07-05T12:55:32","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":26,"name":"444","visibility":"scope","createdOn":"2016-07-05T12:55:44","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":27,"name":"test111","visibility":"scope","createdOn":"2016-07-05T13:43:21","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":28,"name":"vvvv","visibility":"public","createdOn":"2016-07-05T13:43:47","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":29,"name":"zzzz","visibility":"private","createdOn":"2016-07-05T14:14:58","executedOn":null,"createdBy":"rep_power","withMap":true,"isDefault":false,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true},{"id":30,"name":"mmm","visibility":"private","createdOn":"2016-07-05T14:17:19","executedOn":"2016-07-05T15:21:33","createdBy":"rep_power","withMap":true,"isDefault":true,"editable":true,"shareable":["PRIVATE","SCOPE","PUBLIC"],"deletable":true}],"code":200};

    $scope.reportsHistory = [];
    var username = userService.getUserName();
    var sectionMine = {'text': 'YOUR REPORTS', 'items': []};
    var sectionShared = {'text': 'PUBLIC REPORTS', 'items': []};

    var nrMine = 0;
    var nrShared = 0;
    angular.forEach(response.data,function(item) {
        var newItem;
        if(username === item.createdBy && nrMine < 3){
            newItem = item;
            newItem.code = item.id;
            newItem.text = item.name;
            sectionMine.items.push(newItem);
            nrMine += 1; 
        }else if(item.visibility !== 'private' && nrShared < 3){
            newItem = item;
            newItem.code = item.id;
            newItem.text = item.name;
            sectionShared.items.push(newItem);
            nrShared += 1; 
        }
    });

    if(nrMine){
        $scope.reportsHistory.push(sectionMine);
    }
    if(nrShared){
        $scope.reportsHistory.push(sectionShared);
    }

    //Other controls
//    $scope.otherEnable = function(){
//        console.log('enable other');
//    };
//
//    $scope.otherDisable = function(){
//        console.log('disable other');
//    };
});
