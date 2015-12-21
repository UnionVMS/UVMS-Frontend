angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, globalSettingsService, reportService, mapService, csvWKTService, unitConversionService){
    $scope.selectedVmsTab = 'MOVEMENTS';
    $scope.isPosFilterVisible = false;
    $scope.isSegFilterVisible = false;
    $scope.isTrackFilterVisible = false;
    $scope.itemsByPage = 25;
    $scope.executedReport = reportService;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    $scope.decimalDegrees = true;
    
    //config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: globalSettingsService.getDateFormat()
    };
    
    //Define VMS tabs
    var setVmsTabs = function(){
        return [
                {
                    'tab': 'MOVEMENTS',
                    'title': locale.getString('spatial.tab_movements')
                },
                {
                    'tab': 'SEGMENTS',
                    'title': locale.getString('spatial.tab_segments')
                },
                {
                    'tab': 'TRACKS',
                    'title': locale.getString('spatial.tab_tracks')
                }
            ];
        };
    
        
   locale.ready('spatial').then(function(){
       $scope.vmsTabMenu = setVmsTabs();
   });
   
   $scope.selectVmsTab = function(tab){
       $scope.selectedVmsTab = tab;
   };
   
   $scope.isVmsTabSelected = function(tab){
       return $scope.selectedVmsTab === tab;
   };
   
   $scope.toggleFiltersRow = function(type){
       switch (type){
           case 'positions':
               $scope.isPosFilterVisible = !$scope.isPosFilterVisible;
               if ($scope.isPosFilterVisible === true){
                   if (globalSettingsService.getCoordinateFormat() === 'decimalDegrees'){
                       $scope.decimalDegrees = true;
                   } else {
                       $scope.decimalDegrees = false;
                   }
               }
               break;
           case 'segments':
               $scope.isSegFilterVisible = !$scope.isSegFilterVisible;
               break;
           case 'tracks':
               $scope.isTrackFilterVisible = !$scope.isTrackFilterVisible;
               break;
       }
   };
   
   $scope.clearDateFilters = function(){
       $scope.startDate = undefined;
       $scope.endDate = undefined;
   };
   
   $scope.$watch('startDate', function(newVal, oldVal){
       if (angular.isDefined($scope.executedReport.positions) && $scope.executedReport.positions.length > 0){
           var el = angular.element('#stStartDateInput');
           el.trigger('input');
       }
   });
   
   $scope.$watch('endDate', function(newVal, oldVal){
       if (angular.isDefined($scope.executedReport.positions) && $scope.executedReport.positions.length > 0){
           var el = angular.element('#stEndDateInput');
           el.trigger('input');
       }
   });
   
   //Positions table config
   $scope.displayedPositions = [].concat($scope.executedReport.positions);
   
   //Segments table config
   $scope.displayedSegments = [].concat($scope.executedReport.segments);
   
   //Tracks table config
   $scope.displayedTracks = [].concat($scope.executedReport.tracks);
   
   $scope.buildTrackGeomFromId = function(id, extent){
       var segLayer = mapService.getLayerByType('vmsseg');
       if (angular.isDefined(segLayer)){
           var coords = [];
           var counter = 0;
           var layer = mapService.getLayerByType('highlight').getSource();
           layer.clear(true);
           segLayer.getSource().forEachFeatureInExtent(extent, function(feature){
               if (feature.get('trackId') === id){
                   if (feature.getGeometry().getLength() !== 0){
                           coords.push(feature.getGeometry().getCoordinates());
                   }
                   
               }
           });
           
           var geom = new ol.geom.MultiLineString(coords, 'XY');
           geom.set('GeometryType', 'MultiLineString');
           
           return geom;
       }
   };
   
   $scope.zoomTo = function(index, geomType){
       var geom;
       if (geomType === 'POSITION'){
           geom = new ol.geom.Point($scope.displayedPositions[index].geometry.coordinates);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.set('GeometryType', 'LineString');
       } else {
           geom = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
       }
       
       geom.transform('EPSG:4326', mapService.getMapProjectionCode());
       if (geomType !== 'TRACK'){
           mapService.highlightFeature(geom);
       } else {
           var trackGeom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, geom.getExtent());
           mapService.highlightFeature(trackGeom);
       }
       
       mapService.zoomTo(geom);
       $scope.$emit('mapAction');
   };
   
   $scope.panTo = function(index, geomType){
       var coords, geom;
       if (geomType === 'POSITION'){
           coords = ol.proj.transform($scope.displayedPositions[index].geometry.coordinates, 'EPSG:4326', mapService.getMapProjectionCode());
           geom = new ol.geom.Point(coords);
           geom.set('GeometryType', 'Point');
           mapService.highlightFeature(geom);
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom.set('GeometryType', 'LineString');
           coords = mapService.getMiddlePoint(geom);
           mapService.highlightFeature(geom);
       } else{
           coords = ol.proj.transform($scope.displayedTracks[index].nearestPoint, 'EPSG:4326', mapService.getMapProjectionCode());
           var polyExtent = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
           polyExtent.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, polyExtent.getExtent());
           geom.set('GeometryType', 'MultiLineString');
           mapService.highlightFeature(geom);
       }
       mapService.panTo(coords);
       $scope.$emit('mapAction');
   };
   
   //Reduce positions for export
   $scope.reducePositions = function(data){
       return data.reduce(
           function(csvObj, rec){
               var row = [
                   rec.properties.countryCode,
                   rec.properties.externalMarking,
                   rec.properties.ircs,
                   rec.properties.cfr,
                   rec.properties.name,
                   moment.utc(rec.properties.positionTime).format($scope.config.target_format),
                   rec.geometry.coordinates[1],
                   rec.geometry.coordinates[0],
                   rec.properties.status,
                   rec.properties.reportedSpeed,
                   rec.properties.calculatedSpeed,
                   rec.properties.reportedCourse,
                   rec.properties.movementType,
                   rec.properties.activityType,
                   rec.properties.source
               ];
               
               csvObj.push(row);
               return csvObj;
           }, []
       );
   };
   
   //Reduce segments for export
   $scope.reduceSegments = function(data){
       var wkt = new ol.format.WKT();
       var geoJson = new ol.format.GeoJSON();
       return data.reduce(
           function(csvObj, rec){
               var geom = wkt.writeGeometry(geoJson.readGeometry(rec.geometry));
               var row = [
                   rec.properties.countryCode,
                   rec.properties.externalMarking,
                   rec.properties.ircs,
                   rec.properties.cfr,
                   rec.properties.name,
                   rec.properties.distance,
                   unitConversionService.duration.timeToHuman(rec.properties.duration),
                   rec.properties.speedOverGround,
                   rec.properties.courseOverGround,
                   rec.properties.segmentCategory,
                   geom
               ];
               
               csvObj.push(row);
               return csvObj;
           }, []
       );
   };
   
   //Reduce tracks for export
   $scope.reduceTracks = function(data){
       var wkt = new ol.format.WKT();
       return data.reduce(
           function(csvObj, rec){
               var row = [
                   rec.countryCode,
                   rec.externalMarking,
                   rec.ircs,
                   rec.cfr,
                   rec.name,
                   rec.distance,
                   unitConversionService.duration.timeToHuman(rec.duration),
                   unitConversionService.duration.timeToHuman(rec.totalTimeAtSea)
               ];
               
               if ($scope.executedReport.tabs.map === true){
                   var extentPolygon = new ol.geom.Polygon.fromExtent(rec.extent);
                   extentPolygon.transform('EPSG:4326', mapService.getMapProjectionCode());
                   var trackGeom = $scope.buildTrackGeomFromId(rec.id, extentPolygon.getExtent());
                   trackGeom.transform(mapService.getMapProjectionCode(), 'EPSG:4326');
                   
                   var geom = null;
                   if (trackGeom.getLineString().getLength() !== 0){
                       geom = wkt.writeGeometry(trackGeom);
                   }
                   
                   row.push(geom);
               }                   
               
               csvObj.push(row);
               return csvObj;
           }, []
       );
   };
   
   $scope.exportAsCSV = function(type, data){
       var filename, header, exportData;
       var speedUnit = unitConversionService.speed.getUnit();
       var distanceUnit = unitConversionService.distance.getUnit();
       if (type === 'positions'){
           filename = locale.getString('spatial.tab_vms_export_csv_positions_filename');
           header = [
               locale.getString('spatial.tab_vms_pos_table_header_fs'),
               locale.getString('spatial.tab_vms_pos_table_header_ext_mark'),
               locale.getString('spatial.tab_vms_pos_table_header_ircs'),
               locale.getString('spatial.tab_vms_pos_table_header_cfr'),
               locale.getString('spatial.tab_vms_pos_table_header_name'),
               locale.getString('spatial.tab_vms_pos_table_header_date'),
               locale.getString('spatial.tab_vms_pos_table_header_lat'),
               locale.getString('spatial.tab_vms_pos_table_header_lon'),
               locale.getString('spatial.tab_vms_pos_table_header_status'),
               locale.getString('spatial.tab_vms_pos_table_header_measured_speed') + '(' + speedUnit + ')',
               locale.getString('spatial.tab_vms_pos_table_header_calculated_speed') + '(' + speedUnit + ')',
               locale.getString('spatial.tab_vms_pos_table_header_course') + '(\u00B0)',
               locale.getString('spatial.tab_vms_pos_table_header_msg_type'),
               locale.getString('spatial.tab_vms_pos_table_header_activity_type'),
               locale.getString('spatial.tab_vms_pos_table_header_source')
           ];
           
           exportData = $scope.reducePositions(data);
       } else if (type === 'segments'){
           filename = locale.getString('spatial.tab_vms_export_csv_segments_filename');
           header = [
               locale.getString('spatial.tab_vms_pos_table_header_fs'),
               locale.getString('spatial.tab_vms_pos_table_header_ext_mark'),
               locale.getString('spatial.tab_vms_pos_table_header_ircs'),
               locale.getString('spatial.tab_vms_pos_table_header_cfr'),
               locale.getString('spatial.tab_vms_pos_table_header_name'),
               locale.getString('spatial.tab_vms_seg_table_header_distance') + '(' + distanceUnit + ')',
               locale.getString('spatial.tab_vms_seg_table_header_duration'),
               locale.getString('spatial.tab_vms_seg_table_header_speed_ground') + '(' + speedUnit + ')',
               locale.getString('spatial.tab_vms_seg_table_header_course_ground') + '(\u00B0)',
               locale.getString('spatial.tab_vms_seg_table_header_category'),
               locale.getString('spatial.tab_vms_seg_table_header_geometry')
           ];
           
           exportData = $scope.reduceSegments(data);
       } else if (type === 'tracks'){
           filename = locale.getString('spatial.tab_vms_export_csv_tracks_filename');
           header = [
                 locale.getString('spatial.tab_vms_pos_table_header_fs'),
                 locale.getString('spatial.tab_vms_pos_table_header_ext_mark'),
                 locale.getString('spatial.tab_vms_pos_table_header_ircs'),
                 locale.getString('spatial.tab_vms_pos_table_header_cfr'),
                 locale.getString('spatial.tab_vms_pos_table_header_name'),
                 locale.getString('spatial.tab_vms_seg_table_header_distance') + '(' + distanceUnit + ')',
                 locale.getString('spatial.tab_vms_seg_table_header_duration'),
                 locale.getString('spatial.tab_vms_tracks_table_header_time_at_sea')
           ];
           
           if ($scope.executedReport.tabs.map === true){
               header.push(locale.getString('spatial.tab_vms_seg_table_header_geometry'));
           }
             
           exportData = $scope.reduceTracks(data);
       }
       
       //Create and download the file
       if (angular.isDefined(exportData)){
           csvWKTService.downloadCSVFile(exportData, header, filename);
       }
   };
});