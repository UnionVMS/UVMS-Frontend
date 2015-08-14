angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, datatablesService, reportRestService, DTOptionsBuilder, DTColumnDefBuilder){
    $scope.selectedVmsTab = 'MOVEMENTS';
    
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
   $scope.positions = [];
   $scope.posTable.dtOptions = DTOptionsBuilder.newOptions()
                                   .withBootstrap()
                                   .withPaginationType('simple_numbers')
                                   .withDisplayLength(25)
                                   .withLanguage(datatablesService)
                                   .withDOM('trpi')
                                   .withColumnFilter({
                                       aoColumns: [{
                                           type: 'null'
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
                                           type: 'null'
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
       DTColumnDefBuilder.newColumnDef(4),
       DTColumnDefBuilder.newColumnDef(5),
       DTColumnDefBuilder.newColumnDef(6),
       DTColumnDefBuilder.newColumnDef(7),
       DTColumnDefBuilder.newColumnDef(8),
       DTColumnDefBuilder.newColumnDef(9),
       DTColumnDefBuilder.newColumnDef(10),
       DTColumnDefBuilder.newColumnDef(11),
       DTColumnDefBuilder.newColumnDef(12).notSortable()
   ];
   
   //Get Report List Success callback
   var getVmsDataSuccess = function(data){
       console.log(data);
       $scope.positions = data.movements.features;
   };
   
   //Get Report List Failure callback
   var getVmsDataError = function(error){
       //TODO warn the user
       console.log(error);
       $scope.reports = [];
   };
   
   reportRestService.getVmsData().then(getVmsDataSuccess, getVmsDataError);

});