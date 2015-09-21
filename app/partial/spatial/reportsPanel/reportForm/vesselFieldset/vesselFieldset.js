angular.module('unionvmsWeb').controller('VesselfieldsetCtrl',function($scope, locale, vesselRestService, GetListRequest, datatablesService, DTOptionsBuilder, DTColumnDefBuilder){
    $scope.selectedVesselMenu = 'SIMPLE';
    
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
                                    .withDOM('trp')
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
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5).notSortable()
    ];
    
    //Delete one selected item (vessel or group)
    $scope.deleteSelection = function(index){
        $scope.report.vesselsSelection.splice(index, 1);
    };
    
    //Delete all selected items
    $scope.deleteSelectionAll = function(){
        $scope.report.vesselsSelection.splice(0,$scope.report.vesselsSelection.length);
    };
    
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
                                    .withDOM('trp')
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
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5)
    ];
    
    $scope.toggleAllVessels = function(){
        for (var i = 0; i < $scope.shared.vessels.length; i++){
            $scope.shared.vessels[i].selected = $scope.vesselTable.selectAll;
        }
        
        if ($scope.vesselTable.selectAll === true){
            $scope.vesselTable.selectedVessels = $scope.shared.vessels.length;
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
        
        if ($scope.vesselTable.selectedVessels === $scope.shared.vessels.length){
            $scope.vesselTable.selectAll = true;
        } else {
            $scope.vesselTable.selectAll = false;
        }
    };
    
    //Check if vessel record was already added to the report current selection
    $scope.checkVesselIsSelected = function(vesselSrc){
        var response = false;
        for (var i = 0; i < $scope.report.vesselsSelection.length; i++){
            if (vesselSrc.vesselId.guid === $scope.report.vesselsSelection[i].guid){
                response = true;
            }
        }
        return response;
    };
    
    //Just for display purposes
    $scope.translateSelectionType = function(type){
        var searchString = 'spatial.reports_form_vessel_selection_type_' + type;
        return locale.getString(searchString);
    };
    
    $scope.addVesselSelection = function(){
        for (var i = 0; i < $scope.shared.vessels.length; i++){
            var vesselSrc = $scope.shared.vessels[i];
            if (vesselSrc.selected === true && $scope.checkVesselIsSelected(vesselSrc) === false){
                $scope.report.vesselsSelection.push({
                    guid: vesselSrc.vesselId.guid,
                    fs: vesselSrc.countryCode,
                    ircs: vesselSrc.ircs,
                    cfr: vesselSrc.cfr,
                    em: vesselSrc.externalMarking,
                    name: vesselSrc.name,
                    type: 'vessel'
                });
            }
        }
    };
    
    $scope.searchVessels = function(){
        if ($scope.shared.searchVesselString !== ''){
            var searchableFields = ['FLAG_STATE', 'EXTERNAL_MARKING', 'NAME', 'IRCS', 'CFR'];
            var getVesselListRequest = new GetListRequest(1, 100000, false, []);
            
            for (var i = 0; i < searchableFields.length; i++){
                //FIXME when case insensitive search is implemented 
                getVesselListRequest.addSearchCriteria(searchableFields[i], $scope.shared.searchVesselString.toUpperCase() + '*');
            }
            
            vesselRestService.getVesselList(getVesselListRequest).then(getVesselsSuccess, getVesselsError);
        }
    };
    
    var getVesselsSuccess = function(response){
        $scope.shared.vessels = response.items;
    };
    
    var getVesselsError = function(error){
        //TODO warn the user
        console.log(error);
    };
    
});