angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, mapService, datatablesService, DTOptionsBuilder, DTColumnDefBuilder){
    $scope.selectedVmsTab = 'MOVEMENTS';
    
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
           if (moment(displayDate, $scope.config.src_format, true).isValid() === true){
               displayDate = moment(displayDate, $scope.config.src_format, true).format($scope.config.target_format);
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
       DTColumnDefBuilder.newColumnDef(12).notSortable()
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
           mapService.highlightFeature(geom);
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.executedReport.segments[index].geometry.coordinates);
           geom.set('GeometryType', 'LineString');
           mapService.highlightFeature(geom);
       } else {
           geom = new ol.geom.Polygon.fromExtent($scope.executedReport.tracks[index].extent);
           //TODO build linestring
           //geom.set('GeometryType', 'LineString');
       }
       geom.transform('EPSG:4326', mapService.getMapProjectionCode());
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