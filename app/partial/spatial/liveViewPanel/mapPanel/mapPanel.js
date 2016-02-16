angular.module('unionvmsWeb').controller('MapCtrl',function($log, $scope, locale, $timeout, $document, $templateRequest, mapService, spatialHelperService, reportService, mapFishPrintRestService, MapFish, MapFishPayload, spatialRestService, $window){
    $scope.activeControl = '';
    $scope.showMeasureConfigWin = false;
    $scope.showPrintConfigWin = false;
    $scope.showMapFishConfigWin = false;
    $scope.winExpanded = true;
    $scope.measureConfigs = spatialHelperService.measure;
    $scope.print = spatialHelperService.print;
    $scope.mapFish = MapFish;
    $scope.tbControl = spatialHelperService.tbControl;
    $scope.refresh = reportService.refresh;
    $scope.mapFishLocalConfig = {}; // TODO change name
    $scope.popupSegments = mapService.popupSegRecContainer;
    $scope.bookmarksByPage = 3;
    $scope.bookmarkNew = {};
    $scope.submitingBookmark = false;
    $scope.isAddBookVisible = false;
    
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
        if (direction === 'next' && $scope.popupSegments.currentIdx < $scope.popupSegments.records.length - 1){
            $scope.popupSegments.currentIdx += 1;
            $scope.updatePopup();
        } else if (direction === 'previous' && $scope.popupSegments.currentIdx > 0){
            $scope.popupSegments.currentIdx -= 1;
            $scope.updatePopup();
        }
    };
    
    //Update popup content
    $scope.updatePopup = function(){
        var record = mapService.popupSegRecContainer.records[mapService.popupSegRecContainer.currentIdx];
        var data = mapService.setSegmentsObjPopup(record.data);
        mapService.requestPopupTemplate(data, record.coord, record.fromCluster, true);
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
    };
    
    $scope.openMapFishConfigWin = function(){
        $scope.showMapFishConfigWin = true;
        var win = angular.element('#map-fish-print-config');
        var btnPos = angular.element('#map-fish-print-config-btn').offset();
        $scope.setWinDraggable(win, btnPos);
        mapService.addPrintExtent();
    };
    
    //Deactivate Mapfish
    $scope.mapFishPrintDisable = function(){
        $scope.showMapFishConfigWin = false;
        $scope.winExpanded = true;
        var layer = mapService.getLayerByType('print');
        if (angular.isDefined(layer)){
            mapService.map.removeLayer(layer);
            mapService.map.removeInteraction(mapService.getCustomInteraction('Pointer', 'dragExtent')[0]);
        }
    };
    
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

    //Prepare print reuqest
    $scope.printMapWithMapFish = function() {
        $log.debug("Requesting print job");
        
        var payload = new MapFishPayload();
        
        var positions = payload.getIconPayload('positions');
        var segments = payload.getIconPayload('segments');
        
        //prepare the payload to get icons and legends from our web service
        if (angular.isDefined(positions) && angular.isDefined(segments)){
            var iconPayload = {
                positions: positions,
                segments:  segments
            };
            
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
                                else if(MapFish.jobStatusData.status === 'finished'){
                                   $scope.download(MapFish.jobStatusData.downloadURL); //TODO - test this when we have the admin configurations
                                }
                            },function (error) {
                                $log.error(error);
                            }
                        );
                    }
                };
                poller();
            },function (error) {
                $log.error(error);
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
    };

    //Print control
    $scope.printEnable = function(){
        $scope.openPrintConfigWin();
    };

    $scope.openPrintConfigWin = function(){
        $scope.showPrintConfigWin = true;
        var win = angular.element('#print-config');
        var btnPos = angular.element('#export-map').offset();
        $scope.setWinDraggable(win, btnPos);
    };

    $scope.printMap = function () {
        var exportType;
        var fileName = locale.getString('spatial.map_export_filename');
        switch ($scope.print.exportFormat) {
            case 'png':
                fileName += '.png';
                exportType = 'image/png';
                break;
            case 'jpeg':
                fileName += '.jpeg';
                exportType = 'image/jpeg';
                break;
            case 'pdf':
                fileName += '.pdf';
                exportType = 'image/jpeg';
                break;
            default:
                break;
        }

        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('download', fileName);
        downloadLink.attr('target', '_blank');

        mapService.map.once('postcompose', function (evt) {
            var canvas = evt.context.canvas;
            if ($scope.print.exportFormat === 'pdf') {
                var img = canvas.toDataURL(exportType);
                var imgSize = {
                    width: canvas.width,
                    height: canvas.height
                };
                var doc = new jsPDF($scope.print.layout, 'mm', 'a4');
                if ($scope.print.layout === 'portrait') {
                    $scope.setPortraitPdf(doc, img, imgSize);
                } else {
                    $scope.setLandscapePdf(doc, img, imgSize);
                }
                downloadLink.attr('href', doc.output('datauristring'));
            } else {
                downloadLink.attr('href', canvas.toDataURL(exportType));
            }

            $document.find('body').append(downloadLink);
            $timeout(function () {
                downloadLink[0].click();
                downloadLink.remove();
            }, null);
        });

        mapService.map.renderSync();
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
        mapService.zoomTo(geom);
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
    
    //Scale the map image to fit PDF page while keeping the aspect ratio
    $scope.getFinalMapSize = function (originalSize, targetSize) {
        var scaleWidth = originalSize.width / targetSize.maxWidth;
        var scaleHeight = originalSize.height / targetSize.maxHeight;

        var size = {};
        if (scaleWidth > scaleHeight) {
            size.width = originalSize.width / scaleWidth;
            size.height = originalSize.height / scaleWidth;
        } else {
            size.width = originalSize.width / scaleHeight;
            size.height = originalSize.height / scaleHeight;
        }

        return size;
    };

    //Build portrait PDF layout
    $scope.setPortraitPdf = function (doc, map, mapSize) {
        if (angular.isDefined($scope.print.title)) {
            doc.setTextColor(41, 128, 185);
            doc.setFontSize(18);
            $scope.centerText(doc, $scope.print.title, $scope.print.portrait.title.top);
        }

        //Add map image
        var size = $scope.getFinalMapSize(mapSize, $scope.print.portrait.mapSize);
        var marginLeft = 10;
        if (size.width < doc.internal.pageSize.width) {
            marginLeft = (doc.internal.pageSize.width - size.width) / 2;
        }
        doc.addImage(map, 'jpeg', marginLeft, 25, size.width, size.height);

        //Add footer
        $scope.writeFooter(doc, 'portrait');
    };

    //Build landscape PDF layout
    $scope.setLandscapePdf = function (doc, map, mapSize) {
        if (angular.isDefined($scope.print.title)) {
            doc.setTextColor(41, 128, 185);
            doc.setFontSize(18);
            $scope.centerText(doc, $scope.print.title, $scope.print.landscape.title.top);
        }

        //Add map image
        var size = $scope.getFinalMapSize(mapSize, $scope.print.landscape.mapSize);
        var marginLeft = 10;
        if (size.width < doc.internal.pageSize.width) {
            marginLeft = (doc.internal.pageSize.width - size.width) / 2;
        }
        doc.addImage(map, 'jpeg', marginLeft, 25, size.width, size.height);

        //Add footer
        $scope.writeFooter(doc, 'landscape');
    };

    //Add PDF footer with date and UnionVMS copyright
    $scope.writeFooter = function (doc, layout) {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text($scope.print[layout].footer.left, $scope.print[layout].footer.bottom, moment().utc().format('YYYY-MM-DD HH:mm Z') + ' UTC');
        doc.text($scope.print[layout].footer.right, $scope.print[layout].footer.bottom, locale.getString('spatial.map_export_copyright') + ' unionVMS');
    };

    //Center text in PDF doc
    $scope.centerText = function (doc, text, offsetY) {
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(textOffset, offsetY, text);
    };

    $scope.printDisable = function () {
        $scope.showPrintConfigWin = false;
        $scope.print.exportFormat = 'png';
        $scope.print.layout = 'portrait';
        $scope.print.title = undefined;
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
    		if($scope.showPrintConfigWin){
    			$scope.openPrintConfigWin();
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

angular.module('unionvmsWeb').controller('MappanelCtrl',function($scope, locale, mapService, spatialHelperService){
    //Initial mock config object
    $scope.config = {
        map: {
            projection: {
                epsgCode: 3857, //So far we only support 3857 and 4326
                units: 'm',
                global: true,
                axis: 'enu',
                extent: '-20026376.39;-20048966.10;20026376.39;20048966.10'
            },
            control: [{
                type: 'zoom'
            },{
                type: 'drag'
            },{
                type: 'scale',
                units: 'nautical' //Possible values: metric, degrees, nautical, us, imperial
            },{
                type: 'mousecoords',
                epsgCode: 4326,
                format: 'dd' //Possible values: dd, dms, ddm, m
            },{
                type: 'history'
            }],
            tbControl: [{
                type: 'measure'
            },{
                type: 'fullscreen'
            },{
                type: 'print'
            },{
                type: 'mapFishPrint'
            },{
                type: 'bookmarks'
            }]
        }
    };

    locale.ready('spatial').then(function(){
        mapService.setMap($scope.config);
        $scope.map = mapService.map;
        spatialHelperService.setToolbarControls($scope.config);
    });
});