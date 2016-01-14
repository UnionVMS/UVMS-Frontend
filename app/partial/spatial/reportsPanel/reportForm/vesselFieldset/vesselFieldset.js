angular.module('unionvmsWeb').controller('VesselfieldsetCtrl',function($scope, locale, $timeout, $modal, vesselRestService, GetListRequest){
    $scope.selectedVesselMenu = 'SIMPLE';
    $scope.vesselSearchLoading = false;
    $scope.hasError = false;
    $scope.errorMessage = undefined;
    
    $scope.isVesselMenuVisible = function(type){
        return $scope.selectedVesselMenu === type;
    };
    
    $scope.toggleVesselMenuType = function(type){
        $scope.selectedVesselMenu = type;
    };
    
    //Hide error message
    $scope.hideError = function(){
        $timeout(function(){
            $scope.hasError = false;
            $scope.errorMessage = undefined;
        }, 5000);
    };
    
    //CURRENT SELECTION TABLE
    $scope.vesselsSelectionTable = {};
    
    //Table config
    $scope.vesselsSelectionByPage = 10;
    
    //Delete one selected item (vessel or group)
    $scope.deleteSelection = function(index){
        $scope.report.vesselsSelection.splice($scope.report.vesselsSelection.indexOf($scope.displayedRecordsSelection[index]), 1);
    };
    
    //Delete all selected items
    $scope.deleteSelectionAll = function(){
        $scope.report.vesselsSelection.splice(0,$scope.report.vesselsSelection.length);
    };
    
    $scope.vesselTable = {};
    $scope.vesselsByPage = 10;
    

    $scope.toggleAllVessels = function(){
        for (var i = 0; i < $scope.displayedRecords.length; i++){
            $scope.displayedRecords[i].selected = $scope.shared.selectAll;
        }
        $scope.checkIfAnyVesselSelected();
    };
    
    $scope.toggleOneVessel = function(vessel){
    	$scope.checkIfAllVesselsSelected();
    	$scope.checkIfAnyVesselSelected();
    };
    
    //Check if vessel record was already added to the report current selection
    $scope.checkVesselIsSelected = function(vesselSrc){
        var response = false;
        for (var i = 0; i < $scope.report.vesselsSelection.length; i++){
            if (angular.isDefined(vesselSrc.vesselId) && $scope.report.vesselsSelection[i].type === 'asset' && vesselSrc.vesselId.guid === $scope.report.vesselsSelection[i].guid){
                response = true;
            } else if (angular.isDefined(vesselSrc.guid) && $scope.report.vesselsSelection[i].type === 'vgroup' && vesselSrc.guid === $scope.report.vesselsSelection[i].guid){
                response = true;
            }
        }
        return response;
    };
    
    $scope.checkIfAllVesselsSelected = function(){
    	if(!$scope.shared || !$scope.displayedRecords.length) {
    		return;
    	}
    	
    	for (var i = 0; i < $scope.displayedRecords.length; i++){
            if (!$scope.displayedRecords[i].selected || $scope.displayedRecords[i].selected === false){
            	$scope.shared.selectAll = false;
            	return;
            }
        }
    	$scope.shared.selectAll = true;
    };
    
    $scope.checkIfAnyVesselSelected = function(){
    	if(!$scope.shared || !$scope.displayedRecords.length) {
    		return;
    	}
    	for (var i = 0; i < $scope.displayedRecords.length; i++){
            if ($scope.displayedRecords[i].selected === true){
            	$scope.shared.selectAny = true;
            	return;
            }
        }
    	$scope.shared.selectAny = false;
    };
    
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
    
    //Just for display purposes
    $scope.translateSelectionType = function(type){
        var searchString = 'spatial.reports_form_vessel_selection_type_' + type;
        return locale.getString(searchString);
    };
    
    $scope.addVesselSelection = function(){
        for (var i = 0; i < $scope.displayedRecords.length; i++){
            var vesselSrc = $scope.displayedRecords[i];
            if (vesselSrc.selected === true && $scope.checkVesselIsSelected(vesselSrc) === false){
                var record = {
                    name: vesselSrc.name
                };
                
                if ($scope.shared.vesselSearchBy === 'asset'){
                    record.guid = vesselSrc.vesselId.guid;
                    record.type = 'asset';
                } else {
                    record.guid = vesselSrc.guid;
                    record.user = vesselSrc.user;
                    record.type = 'vgroup';
                }
                
                $scope.report.vesselsSelection.push(record);
            }
        }
    };
    
    $scope.searchVessels = function(){
        if ($scope.shared.searchVesselString !== ''){
            $scope.vesselSearchLoading = true;
            $scope.shared.vessels = [];
            var searchableFields = ['FLAG_STATE', 'EXTERNAL_MARKING', 'NAME', 'IRCS', 'CFR'];
            var getVesselListRequest = new GetListRequest(1, 100000, false, []);
            
            for (var i = 0; i < searchableFields.length; i++){
                getVesselListRequest.addSearchCriteria(searchableFields[i], $scope.shared.searchVesselString + '*');
            }
            
            vesselRestService.getVesselList(getVesselListRequest).then(getVesselsSuccess, getVesselsError);
        }
    };
    
    var getVesselsSuccess = function(response){
        $scope.vesselSearchLoading = false;
        $scope.shared.vessels = response.items;
        $scope.displayedRecords = [].concat($scope.shared.vessels);
        $scope.checkIfAllVesselsSelected();
        $scope.checkIfAnyVesselSelected();
    };
    
    var getVesselsError = function(error){
        $scope.vesselSearchLoading = false;
        $scope.hasError = true;
        $scope.errorMessage = locale.getString('spatial.reports_form_vessel_get_vessel_list_error');
        $scope.hideError();
    };
    
    $scope.$watch('shared.vesselSearchBy', function(newVal, oldVal){
        if (angular.isDefined($scope.shared)){
            $scope.shared.searchVesselString = '';
            $scope.shared.selectAll = false;
            $scope.shared.selectedVessels = 0;
            $scope.shared.vessels = [];
        }
        
        if (newVal === 'vgroup'){
            $scope.vesselSearchLoading = true;
            vesselRestService.getVesselGroupsForUser().then(getVesselGroupsSuccess, getVesselsGroupError);
        }
    });
    
    $scope.buildGroupRecords = function(data){
        var records = [];
        for (var i = 0; i < data.length; i++){
            records.push({
                guid: data[i].id,
                name: data[i].name,
                user: data[i].user
            });
        }
        
        return records;
    };
    
    var getVesselGroupsSuccess = function(response){
        $scope.vesselSearchLoading = false;
        $scope.shared.vessels = $scope.buildGroupRecords(response);
        $scope.displayedRecords = [].concat($scope.shared.vessels);
        $scope.checkIfAllVesselsSelected();
        $scope.checkIfAnyVesselSelected();
    };
    
    var getVesselsGroupError = function(error){
        $scope.vesselSearchLoading = false;
        $scope.hasError = true;
        $scope.errorMessage = locale.getString('spatial.reports_form_vessel_get_vgroup_list_error');
        $scope.hideError();
    };
    
    $scope.$watch('displayedRecords', function() {
    	$scope.checkIfAllVesselsSelected();
    	$scope.checkIfAnyVesselSelected();
    });
    
});