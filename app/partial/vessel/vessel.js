angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $log, locale, savedSearchService, Vessel, searchService, vesselRestService, alertService, $stateParams, csvService, SearchResults, userService, PositionReportModal, $filter) {

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        vesselForm : false
    };

    $scope.currentSearchResults = new SearchResults('', false, locale.getString('vessel.search_zero_results_error'));
    $scope.waitingForVesselDataResponse = false;

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
        searchService.reset();
        $scope.searchVessels();

        //Load vessel details
        var vesselGUID = $stateParams.id;
        if(angular.isDefined(vesselGUID)){
            vesselRestService.getVessel(vesselGUID).then(
                function(vessel) {
                    $scope.vesselObj = vessel.copy();
                    $scope.waitingForVesselDataResponse = false;
                },
                function(error){
                    $log.error("Error loading details for vessel with with GUID: " +vesselGUID);
                    //Show alert and vessel list
                    $scope.waitingForVesselDataResponse = false;
                    toggleFormDetails();
                    alertService.showErrorMessage(locale.getString('vessel.view_vessel_on_failed_to_load_error'));
                }
            );

            //Show vessel form with loading indicator
            $scope.waitingForVesselDataResponse = true;
            toggleFormDetails();
        }
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchVessels();
        }
    };

    $scope.searchVessels = function(){
        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.filter = '';
        $scope.currentSearchResults.setLoading(true);
        searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
    };

    //Update the search results
    var updateSearchResults = function(vesselListPage){
        $scope.currentSearchResults.updateWithNewResults(vesselListPage);
    };

    //Handle error from search results (listing vessel)
    var onGetSearchResultsError = function(response){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Is user allowed to edit vessels?
    $scope.allowedToEditVessel = function(){
        return checkAccessToFeature('manageVessels');
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

    $scope.setVesselObj = function(vessel){
        $scope.vesselObj = vessel;
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
        toggleFormDetails();
    };

    //Toggle between vessel details and vessel list
    var toggleFormDetails = function(){
        $scope.isVisible.vesselForm = !$scope.isVisible.vesselForm;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.getSelectedItemsInFilter().length){
            if(selectedItem.code === 'SAVE'){
                var options = {
                    dynamicSearch : false,
                    selectedItems : $scope.getSelectedItemsInFilter()
                };
                savedSearchService.openSaveSearchModal("VESSEL", options);
            }else if(selectedItem.code === 'EXPORT'){
                $scope.exportVesselsAsCSVFile(true);
           }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    //Get the selected items that are shown by the filter
    $scope.getSelectedItemsInFilter = function(){
        return $filter('filter')($scope.selectedVessels, $scope.currentSearchResults.filter);
    };

    //Export data as CSV file
    $scope.exportVesselsAsCSVFile = function(onlySelectedItems){
        var filename = 'assets.csv';

        //Set the header columns
        var header = [
            locale.getString('vessel.table_header_flag_state'),
            locale.getString('vessel.table_header_external_marking'),
            locale.getString('vessel.table_header_name'),
            locale.getString('vessel.table_header_signal'),
            locale.getString('vessel.table_header_gear_type'),
            locale.getString('vessel.table_header_license_type'),
            locale.getString('vessel.table_header_last_report'),

        ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.getSelectedItemsInFilter();
            }
            //Export items in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            //Only select those shown by filter
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                        item.countryCode,
                        item.externalMarking,
                        item.name,
                        item.ircs,
                        $filter('vesselGearTypeTranslation')(item.gearType),
                        $filter('vesselLicenseTypeTranslation')(item.licenseType),
                        angular.isDefined(item.lastMovement) ? $filter('timeAgo')(item.lastMovement.time) : '',
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);
    };

    //Show a position report
    $scope.showReport = function(reportGuid){
        PositionReportModal.showReportWithGuid(reportGuid);
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();
});
