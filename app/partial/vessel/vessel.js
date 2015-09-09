angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, locale, savedSearchService, Vessel, searchService, vesselRestService, alertService, $stateParams, csvService, SearchResults) {

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        vesselForm : false
    };

    $scope.currentSearchResults = new SearchResults('', false, locale.getString('vessel.search_zero_results_error'));

    //Selected by checkboxes
    $scope.selectedVessels = [];

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.save_as_group'), code : 'SAVE'},
        {text:locale.getString('common.view_on_map'), code : 'MAP'},
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];


    //Init function when entering page
    var init = function(){
        //Load list with vessels
        $scope.searchVessels();

        //Load vessel details
        var vesselGUID = $stateParams.id;
        if(angular.isDefined(vesselGUID)){
            vesselRestService.getVessel(vesselGUID).then(
                function(vessel) {
                    $scope.toggleViewVessel(vessel);
                }, 
                function(error){
                    console.error("Error loading details for vessel with with GUID: " +vesselGUID);
                    alertService.showErrorMessage(locale.getString('vessel.view_vessel_on_failed_to_load_error'));                
                }
            );
        }
    };

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.setLoading(true);
            searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    $scope.searchVessels = function(){
        $scope.clearSelection();
        $scope.currentSearchResults.clearForSearch();
        searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(vesselListPage){
        $scope.currentSearchResults.updateWithNewResults(vesselListPage);        
    };

    //Handle error from search results (listing vessel)
    var onGetSearchResultsError = function(response){
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Get original vessel
    $scope.getOriginalVessel = function() {
        if (!$scope.vesselObj) {
            return;
        }

        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            if ($scope.currentSearchResults.items[i].equals($scope.vesselObj)) {
                return $scope.currentSearchResults.items[i];
            }
        }
    };

    $scope.mergeCurrentVesselIntoSearchResults = function() {
        var vesselsInList = $scope.currentSearchResults.items;
        for (var i = 0; i < vesselsInList.length; i++) {
            if (vesselsInList[i].equals($scope.vesselObj)) {
                vesselsInList[i] = $scope.vesselObj;
                $scope.vesselObj = vesselsInList[i].copy();
            }
        }
    };

    $scope.removeCurrentVesselFromSearchResults = function() {
        var vesselsInList = $scope.currentSearchResults.items;
        var index;
        for (var i = 0; i < vesselsInList.length; i++) {
            if (vesselsInList[i].equals($scope.vesselObj)) {
                index = i;
            }
        }
        //Remove vessel from list
        if(angular.isDefined(index)){
            $scope.currentSearchResults.items.splice(index, 1);
            $scope.vesselObj = undefined;
        }

        //Removed last vessel from list?
        if($scope.currentSearchResults.items.length === 0){
            $scope.searchVessels();
        }
    };        

    //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedVessels = [];
    };

    //Add a vessel to the selection
    $scope.addToSelection = function(item){
        $scope.selectedVessels.push(item);
    };

    //Remove a vessel from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedVessels, function(index, vessel){
            if(vessel.equals(item)){
                $scope.selectedVessels.splice(index, 1);
                return false;
            }
        });
    };

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool){
        $scope.createNewMode = bool;
    };    

    $scope.getVesselObj = function(){
        return $scope.vesselObj;
    };     

    //Toggle create new vessel
    $scope.toggleCreateNewVessel = function(){
        $scope.createNewMode = true;
        toggleVesselForm(new Vessel());
    };

    //Toggle viewing of a vessel
    $scope.toggleViewVessel = function(item, noHideMessage){
        $scope.createNewMode = false;
        toggleVesselForm(item, noHideMessage);
    };

    var toggleVesselForm = function(vessel, noHideMessage){
        //Create copy of the vessel object so we don't edit the object in the vessel list
        if(vessel){
            $scope.vesselObj = vessel.copy();
        }else{
            $scope.vesselObj = undefined;
        }
        if (!noHideMessage) {
            alertService.hideMessage();
        }
        $scope.isVisible.vesselForm = !$scope.isVisible.vesselForm;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if(selectedItem.code === 'SAVE'){
            savedSearchService.openSaveSearchModal("VESSEL", false, $scope.selectedVessels);            
        }else if(selectedItem.code === 'EXPORT'){
            $scope.exportTerminalsAsCSVFile(true);
       }
       $scope.editSelection = "";
    };

    //Export data as CSV file
    $scope.exportTerminalsAsCSVFile = function(onlySelectedItems){
        var filename = 'assets.csv';

        //Set the header columns
        var header = [
            locale.getString('vessel.table_header_flag_state'),
            locale.getString('vessel.table_header_external_marking'),
            locale.getString('vessel.table_header_name'),
            locale.getString('vessel.table_header_signal'),
            locale.getString('vessel.table_header_type'),
            locale.getString('vessel.table_header_license'),
            locale.getString('vessel.table_header_last_report'),

        ];

        //Set the data columns
        var getData = function() {            
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.selectedVessels;
            }
            //Export items in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){ 
                    var csvRow = [
                        item.countryCode,
                        item.externalMarking,
                        item.name,
                        item.ircs,
                        item.vesselType,
                        item.license,
                        item.lastReport
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);        
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });    

    init();
});
