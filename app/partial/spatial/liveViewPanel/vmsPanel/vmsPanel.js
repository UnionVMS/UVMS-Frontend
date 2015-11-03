angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, reportService, mapService, csvWKTService, datatablesService, DTOptionsBuilder, DTColumnDefBuilder){
    $scope.selectedVmsTab = 'MOVEMENTS';
    $scope.executedReport = reportService;
    
    //Mock config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: 'DD-MM-YYYY HH:mm:ss'
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
   
   //Positions table config
   $scope.posTable = {};
   
   $scope.posTable.dtOptions = DTOptionsBuilder.newOptions()
                                   .withBootstrap()
                                   .withPaginationType('simple_numbers')
                                   .withDisplayLength(25)
                                   .withLanguage(datatablesService)
                                   .withDOM('trpi')
                                   .withColumnFilter({
                                       aoColumns: [{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       }, {
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       }]
                                   })
                                   .withBootstrapOptions({
                                       pagination: {
                                           classes: {
                                               ul: 'pagination pagination-sm'
                                           }
                                       }
                                   });
   
   $scope.posTable.dtColumnDefs = [
       DTColumnDefBuilder.newColumnDef(0),
       DTColumnDefBuilder.newColumnDef(1),
       DTColumnDefBuilder.newColumnDef(2),
       DTColumnDefBuilder.newColumnDef(3),
       DTColumnDefBuilder.newColumnDef(4).withOption('type', 'position-date').renderWith(function(data, type, full){
           var displayDate = full[4];
           if (moment.utc(displayDate).isValid()){
               displayDate = moment.utc(displayDate).format($scope.config.target_format);
           }
           return displayDate;
       }),
       DTColumnDefBuilder.newColumnDef(5),
       DTColumnDefBuilder.newColumnDef(6),
       DTColumnDefBuilder.newColumnDef(7),
       DTColumnDefBuilder.newColumnDef(8),
       DTColumnDefBuilder.newColumnDef(9),
       DTColumnDefBuilder.newColumnDef(10),
       DTColumnDefBuilder.newColumnDef(11),
       DTColumnDefBuilder.newColumnDef(12),
       DTColumnDefBuilder.newColumnDef(13).notSortable()
   ];
   
   //Segments table config
   $scope.segTable = {};
   
   $scope.segTable.dtOptions = DTOptionsBuilder.newOptions()
                                   .withBootstrap()
                                   .withPaginationType('simple_numbers')
                                   .withDisplayLength(25)
                                   .withLanguage(datatablesService)
                                   .withDOM('trpi')
                                   .withOption('responsive', true)
                                   .withColumnFilter({
                                       aoColumns: [{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       }, {
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'null'
                                       }]
                                   })
                                   .withBootstrapOptions({
                                       pagination: {
                                           classes: {
                                               ul: 'pagination pagination-sm'
                                           }
                                       }
                                   });
   
   $scope.segTable.dtColumnDefs = [
       DTColumnDefBuilder.newColumnDef(0),
       DTColumnDefBuilder.newColumnDef(1),
       DTColumnDefBuilder.newColumnDef(2),
       DTColumnDefBuilder.newColumnDef(3),
       DTColumnDefBuilder.newColumnDef(4),
       DTColumnDefBuilder.newColumnDef(5),
       DTColumnDefBuilder.newColumnDef(6),
       DTColumnDefBuilder.newColumnDef(7),
       DTColumnDefBuilder.newColumnDef(9).notSortable()
   ];
   
   //Tracks table config
   $scope.tracksTable = {};
   
   $scope.tracksTable.dtOptions = DTOptionsBuilder.newOptions()
                                   .withBootstrap()
                                   .withPaginationType('simple_numbers')
                                   .withDisplayLength(25)
                                   .withLanguage(datatablesService)
                                   .withDOM('trpi')
                                   .withOption('responsive', true)
                                   .withColumnFilter({
                                       aoColumns: [{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'text',
                                           bRegex: true,
                                           bSmart: true
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'number'
                                       },{
                                           type: 'null'
                                       }]
                                   })
                                   .withBootstrapOptions({
                                       pagination: {
                                           classes: {
                                               ul: 'pagination pagination-sm'
                                           }
                                       }
                                   });
   
   $scope.segTable.dtColumnDefs = [
       DTColumnDefBuilder.newColumnDef(0),
       DTColumnDefBuilder.newColumnDef(1),
       DTColumnDefBuilder.newColumnDef(2),
       DTColumnDefBuilder.newColumnDef(3),
       DTColumnDefBuilder.newColumnDef(4),
       DTColumnDefBuilder.newColumnDef(5),
       DTColumnDefBuilder.newColumnDef(6).notSortable()
   ];
   
   $scope.zoomTo = function(index, geomType){
       var geom;
       if (geomType === 'POSITION'){
           geom = new ol.geom.Point($scope.executedReport.positions[index].geometry.coordinates);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.executedReport.segments[index].geometry.coordinates);
           geom.set('GeometryType', 'LineString');
       } else {
           geom = new ol.geom.Polygon.fromExtent($scope.executedReport.tracks[index].extent);
           //TODO build linestring
           //geom.set('GeometryType', 'LineString');
       }
       
       geom.transform('EPSG:4326', mapService.getMapProjectionCode());
       if (geomType !== 'TRACK'){
           mapService.highlightFeature(geom);
       }
       
       mapService.zoomTo(geom);
       $scope.$emit('mapAction');
   };
   
   $scope.panTo = function(index, geomType){
       var coords, geom;
       if (geomType === 'POSITION'){
           coords = ol.proj.transform($scope.executedReport.positions[index].geometry.coordinates, 'EPSG:4326', mapService.getMapProjectionCode());
           geom = new ol.geom.Point(coords);
           geom.set('GeometryType', 'Point');
           mapService.highlightFeature(geom);
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.executedReport.segments[index].geometry.coordinates);
           geom.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom.set('GeometryType', 'LineString');
           coords = mapService.getMiddlePoint(geom);
           mapService.highlightFeature(geom);
       } else{
           coords = ol.proj.transform($scope.executedReport.tracks[index].nearestPoint, 'EPSG:4326', mapService.getMapProjectionCode());
           //TODO build linestring
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
                   rec.properties.ircs,
                   rec.properties.cfr,
                   rec.properties.name,
                   rec.properties.positionTime,
                   rec.geometry.coordinates[1],
                   rec.geometry.coordinates[0],
                   rec.properties.status,
                   rec.properties.reportedSpeed,
                   rec.properties.calculatedSpeed,
                   rec.properties.calculatedCourse,
                   rec.properties.movementType,
                   rec.properties.activityType
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
                   rec.properties.ircs,
                   rec.properties.cfr,
                   rec.properties.name,
                   rec.properties.distance,
                   rec.properties.duration,
                   rec.properties.speedOverGround,
                   rec.properties.courseOverGround,
                   geom
               ];
               
               csvObj.push(row);
               return csvObj;
           }, []
       );
   };
   
   //Reduce tracks for export
   $scope.reduceTracks = function(data){
       return data.reduce(
           function(csvObj, rec){
               var row = [
                   rec.asset.countryCode,
                   rec.asset.ircs,
                   rec.asset.cfr,
                   rec.asset.name,
                   rec.distance,
                   rec.duration
               ];
               
               csvObj.push(row);
               return csvObj;
           }, []
       );
   };
   
   $scope.exportAsCSV = function(type){
       var filename, header, data;
       
       if (type === 'positions'){
           filename = locale.getString('spatial.tab_vms_export_csv_positions_filename');
           header = [
               locale.getString('spatial.tab_vms_pos_table_header_fs'),
               locale.getString('spatial.tab_vms_pos_table_header_ircs'),
               locale.getString('spatial.tab_vms_pos_table_header_cfr'),
               locale.getString('spatial.tab_vms_pos_table_header_name'),
               locale.getString('spatial.tab_vms_pos_table_header_date'),
               locale.getString('spatial.tab_vms_pos_table_header_lat'),
               locale.getString('spatial.tab_vms_pos_table_header_lon'),
               locale.getString('spatial.tab_vms_pos_table_header_status'),
               locale.getString('spatial.tab_vms_pos_table_header_measured_speed'),
               locale.getString('spatial.tab_vms_pos_table_header_calculated_speed'),
               locale.getString('spatial.tab_vms_pos_table_header_course'),
               locale.getString('spatial.tab_vms_pos_table_header_msg_type')
           ];
           
           data = $scope.reducePositions($scope.executedReport.positions);
       } else if (type === 'segments'){
           filename = locale.getString('spatial.tab_vms_export_csv_segments_filename');
           header = [
               locale.getString('spatial.tab_vms_pos_table_header_fs'),
               locale.getString('spatial.tab_vms_pos_table_header_ircs'),
               locale.getString('spatial.tab_vms_pos_table_header_cfr'),
               locale.getString('spatial.tab_vms_pos_table_header_name'),
               locale.getString('spatial.tab_vms_seg_table_header_distance'),
               locale.getString('spatial.tab_vms_seg_table_header_duration'),
               locale.getString('spatial.tab_vms_seg_table_header_speed_ground'),
               locale.getString('spatial.tab_vms_seg_table_header_course_ground'),
               locale.getString('spatial.tab_vms_seg_table_header_geometry')
           ];
           
           data = $scope.reduceSegments($scope.executedReport.segments);
       } else if (type === 'tracks'){
           filename = locale.getString('spatial.tab_vms_export_csv_tracks_filename');
           header = [
                 locale.getString('spatial.tab_vms_pos_table_header_fs'),
                 locale.getString('spatial.tab_vms_pos_table_header_ircs'),
                 locale.getString('spatial.tab_vms_pos_table_header_cfr'),
                 locale.getString('spatial.tab_vms_pos_table_header_name'),
                 locale.getString('spatial.tab_vms_seg_table_header_distance'),
                 locale.getString('spatial.tab_vms_seg_table_header_duration'),
             ];
             
             data = $scope.reduceTracks($scope.executedReport.tracks);
       }
       
       //Create and download the file
       if (angular.isDefined(data)){
           csvWKTService.downloadCSVFile(data, header, filename);
       }
   };
   
   //Custom sort function for the specified date target format
   $.extend($.fn.dataTableExt.oSort, {
       "position-date-pre": function (date){
           return parseInt(moment(date, $scope.config.target_format, true).format('X'));
       },
       "position-date-asc": function (a, b){
           return a - b;
       },
       "position-date-desc": function (a, b){
           return b - a;
       }
   });
});