angular.module('unionvmsWeb').controller('VesselfieldsetCtrl',function($scope, locale, $timeout, $modal, vesselRestService, GetListRequest, datatablesService, DTOptionsBuilder, DTColumnDefBuilder){
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
                                    .withOption('autoWidth', true)
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
//        DTColumnDefBuilder.newColumnDef(2),
//        DTColumnDefBuilder.newColumnDef(3),
//        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(2).notSortable()
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
            $scope.shared.vessels[i].selected = $scope.shared.selectAll;
        }
        
        if ($scope.shared.selectAll === true){
            $scope.shared.selectedVessels = $scope.shared.vessels.length;
        } else {
            $scope.shared.selectedVessels = 0;
        }
    };
    
    $scope.toggleOneVessel = function(vessel){
        if (vessel.selected === true){
            $scope.shared.selectedVessels += 1;
        } else {
            $scope.shared.selectedVessels -= 1;
        }
        
        if ($scope.shared.selectedVessels === $scope.shared.vessels.length){
            $scope.shared.selectAll = true;
        } else {
            $scope.shared.selectAll = false;
        }
    };
    
    //Check if vessel record was already added to the report current selection
    $scope.checkVesselIsSelected = function(vesselSrc){
        var response = false;
        for (var i = 0; i < $scope.report.vesselsSelection.length; i++){
            if (angular.isDefined(vesselSrc.vesselId) && $scope.report.vesselsSelection[i].type === 'vessel' && vesselSrc.vesselId.guid === $scope.report.vesselsSelection[i].guid){
                response = true;
            } else if (angular.isDefined(vesselSrc.id) && $scope.report.vesselsSelection[i].type === 'vgroup' && vesselSrc.id === $scope.report.vesselsSelection[i].id){
                response = true;
            }
        }
        return response;
    };
    
    $scope.viewDetails = function(idx){
        //console.log($scope.report.vesselsSelection[idx]);
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/vesselFieldset/detailsModal/detailsModal.html',
            controller: 'DetailsmodalCtrl',
            size: "small",
            resolve: {
                itemForDetail: function(){
                    return $scope.report.vesselsSelection[idx];
                }
            }
        });
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
                var record = {
                    name: vesselSrc.name
                };
                
                if ($scope.shared.vesselSearchBy === 'vessel'){
                    record.guid = vesselSrc.vesselId.guid;
                    record.type = 'vessel';
                } else {
                    record.id = vesselSrc.id;
                    record.user = vesselSrc.user;
                    record.type = 'vgroup';
                }
                
                $scope.report.vesselsSelection.push(record);
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
    
    $scope.$watch('shared.vesselSearchBy', function(newVal, oldVal){
        if (angular.isDefined($scope.shared)){
            $scope.shared.searchVesselString = '';
            $scope.shared.selectAll = false;
            $scope.shared.selectedVessels = 0;
            $scope.shared.vessels = [];
        }
        
        if (newVal === 'vgroup'){
            vesselRestService.getVesselGroupsForUser().then(getVesselGroupsSuccess, getVesselsGroupError);
        }
    });
    
    $scope.buildGroupRecords = function(data){
        var records = [];
        for (var i = 0; i < data.length; i++){
            records.push({
                id: data[i].id,
                name: data[i].name,
                user: data[i].user
            });
        }
        
        return records;
    };
    
    var getVesselGroupsSuccess = function(response){
        $scope.shared.vessels = $scope.buildGroupRecords(response);
    };
    
    var getVesselsGroupError = function(error){
        //TODO warn the user
        console.log(error);
    };
    
});