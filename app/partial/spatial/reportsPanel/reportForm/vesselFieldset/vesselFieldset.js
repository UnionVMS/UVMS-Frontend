angular.module('unionvmsWeb').controller('VesselfieldsetCtrl',function($scope, locale, datatablesService, DTOptionsBuilder, DTColumnDefBuilder){
    $scope.selectedVesselMenu = 'SELECTION';
    
    $scope.isVesselMenuVisible = function(type){
        return $scope.selectedVesselMenu === type;
    };
    
    $scope.toggleVesselMenuType = function(type){
        $scope.selectedVesselMenu = type;
    };
    
    //CURRENT SELECTION TABLE
    $scope.vesselsSelectionTable = {};
    
    //Table config
    $scope.vesselsSelectionTable.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(25)
                                    .withLanguage(datatablesService)
                                    .withDOM('trpi')
                                    .withBootstrapOptions({
                                        pagination: {
                                            classes: {
                                                ul: 'pagination pagination-sm'
                                            }
                                        }
                                    });
    
    $scope.vesselsSelectionTable.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2).notSortable()
    ];
    
    //Delete one selected item (vessel or group)
    $scope.deleteSelection = function(index){
        $scope.vesselsSelection.splice(index, 1);
    };
    
    //Delete all selected items
    $scope.deleteSelectionAll = function(){
        $scope.vesselsSelection = [];
    };
    
    //VESSEL SIMPLE SEARCH TABLE
    //Mock data
    $scope.vessels = [{
        id: 1,
        name: 'Vessel 1',
        fs: 'BE',
        ircs: '123',
        cfr: '456',
        selected: false
    },{
        id: 2,
        name: 'Vessel 2',
        fs: 'PT',
        ircs: '789',
        cfr: '123',
        selected: false
    }];
    
    $scope.vesselTable = {};
    $scope.vesselTable.selectAll = false;
    $scope.vesselTable.selectedVessels = 0;
    
    //Table config
    $scope.vesselTable.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(25)
                                    .withOption('order', [[1, 'asc']])
                                    .withLanguage(datatablesService)
                                    .withDOM('trpi')
                                    .withBootstrapOptions({
                                        pagination: {
                                            classes: {
                                                ul: 'pagination pagination-sm'
                                            }
                                        }
                                    });
    
    $scope.vesselTable.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4)
    ];
    
    $scope.toggleAllVessels = function(){
        for (var i = 0; i < $scope.vessels.length; i++){
            $scope.vessels[i].selected = $scope.vesselTable.selectAll;
        }
        
        if ($scope.vesselTable.selectAll === true){
            $scope.vesselTable.selectedVessels = $scope.vessels.length;
        } else {
            $scope.vesselTable.selectedVessels = 0;
        }
    };
    
    $scope.toggleOneVessel = function(vessel){
        if (vessel.selected === true){
            $scope.vesselTable.selectedVessels += 1;
        } else {
            $scope.vesselTable.selectedVessels -= 1;
        }
        
        if ($scope.vesselTable.selectedVessels === $scope.vessels.length){
            $scope.vesselTable.selectAll = true;
        } else {
            $scope.vesselTable.selectAll = false;
        }
    };
    
    //Check if vessel record was already added to the report current selection
    $scope.checkVesselIsSelected = function(vesselSrc){
        var response = false;
        for (var i = 0; i < $scope.vesselsSelection.length; i++){
            if (vesselSrc.id === $scope.vesselsSelection[i].id){
                response = true;
            }
        }
        return response;
    };
    
    $scope.addVesselSelection = function(){
        for (var i = 0; i < $scope.vessels.length; i++){
            var vesselSrc = $scope.vessels[i];
            if (vesselSrc.selected === true && $scope.checkVesselIsSelected(vesselSrc) === false){
                $scope.vesselsSelection.push({
                    id: vesselSrc.id,
                    name: vesselSrc.name,
                    type: locale.getString('spatial.reports_form_vessel_selection_type_vessel')
                });
            }
        }
    };
    
});