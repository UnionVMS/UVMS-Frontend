/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $log, locale, savedSearchService, Vessel, VesselContact, searchService, vesselRestService, alertService, $stateParams, csvService, SearchResults, userService, PositionReportModal, $filter) {

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
        {text:locale.getString('common.append_group'), code : 'ADD_TO_GROUP'},
        {text:locale.getString('common.remove_from_group'), code : 'REMOVE_FROM_GROUP'},
        //{text:locale.getString('common.view_on_map'), code : 'MAP'},
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];


    //Init function when entering page
    var init = function(){
        //Load list with vessels based on latest movements
        $scope.searchLatestMovements();

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

    // Search for vessels
    $scope.searchVessels = function(options) {
        $scope.selectedGroupGuid = angular.isDefined(options) && angular.isDefined(options.savedSearchGroup) ? options.savedSearchGroup.id : undefined;

        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.filter = '';
        $scope.currentSearchResults.setLoading(true);
        searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
    };

    // Search for vessels based on latest movements
    $scope.searchLatestMovements = function(options) {
        $scope.selectedGroupGuid = angular.isDefined(options) && angular.isDefined(options.savedSearchGroup) ? options.savedSearchGroup.id : undefined;

        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.filter = '';
        $scope.currentSearchResults.setLoading(true);
        searchService.searchLatestMovements()
            .then(updateSearchResults, onGetSearchResultsError);
    };

    //Update the search results
    var updateSearchResults = function(vesselListPage){
        $scope.currentSearchResults.updateWithNewResults(vesselListPage);

        if(vesselListPage.totalNumberOfLatestMovements) {
            $scope.currentSearchResults.sortBy = '-lastMovement.time';
        }else{
            $scope.currentSearchResults.sortBy = 'name';
        }
    };

    //Handle error from search results (listing vessel)
    var onGetSearchResultsError = function(response){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Is user allowed to edit vessels?
    $scope.allowedToEditVessel = function(vessel){
        // Check permission, and vessel cannot be from source NATIONAL.
        return checkAccessToFeature('manageVessels') && (!vessel || vessel.source !== 'NATIONAL');
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
        $scope.mergeCurrentVesselIntoSearchResults($scope.vesselObj);
    };

    $scope.mergeCurrentVesselIntoSearchResults = function(vesselObj) {
        var vesselsInList = $scope.currentSearchResults.items;
        for (var i = 0; i < vesselsInList.length; i++) {
            if (vesselsInList[i].equals(vesselObj)) {
                vesselsInList[i] = vesselObj;
                vesselObj = vesselsInList[i].copy();
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
        var newVessel = new Vessel();
        newVessel.contact.push(new VesselContact());
        toggleVesselForm(newVessel);
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

    function getVesselGuids(vessels) {
        return vessels.map(function(vessel) {
            return vessel.vesselId.guid;
        });
    }

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        var selectedItems = $scope.getSelectedItemsInFilter();
        if(selectedItems.length > 0){
            if (selectedItem.code === 'SAVE' || selectedItem.code === 'ADD_TO_GROUP') {
                var options = {
                    dynamicSearch : false,
                    selectedItems : selectedItems,
                    append: selectedItem.code === 'ADD_TO_GROUP'
                };
                savedSearchService.openSaveSearchModal("VESSEL", options);
            }
            else if (selectedItem.code === 'REMOVE_FROM_GROUP') {
                removeFromGroup($scope.selectedGroupGuid, getVesselGuids(selectedItems));
            }
            else if (selectedItem.code === 'EXPORT') {
                $scope.exportVesselsAsCSVFile(true);
           }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    /* Removed the selected items from the current group, updates the group list and refreshed search if successful. */
    function removeFromGroup(groupId, selectedItems) {
        if (groupId === undefined) {
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_group_selected'));
            return;
        }

        savedSearchService.removeVesselsFromGroup(groupId, selectedItems).then(function(group) {
            $scope.$broadcast('refreshSavedSearch', group);
        }, function(error) {
            alertService.showErrorMessageWithTimeout(error);
        });
    }

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
            locale.getString('vessel.table_header_cfr'),
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
                        item.cfr,
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
    });

    init();
});
