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
angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, $filter, searchService, alertService, MobileTerminal, SystemTypeAndPlugin, mobileTerminalRestService, pollingService, GetPollableListRequest, pollingRestService, configurationService, $location, locale, $stateParams, csvService, SearchResults, userService){

    $scope.hideAlertsOnScopeDestroy = true;

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        mobileTerminalForm : false
    };

    $scope.createMobileTerminalWithVessel = {
        visible : false
    };

    $scope.currentSearchResults = new SearchResults('', false, locale.getString('mobileTerminal.search_zero_results_error'));

    //Selected by checkboxes
    $scope.selectedMobileTerminals = [];

    //Edit dropdown
    $scope.editSelectionDropdownItems = [];
    if(checkAccessToFeature('managePolls')){
        $scope.editSelectionDropdownItems.push({'text':locale.getString('mobileTerminal.edit_selection_poll_terminals'),'code':'POLL'});
    }
    $scope.editSelectionDropdownItems.push({'text':locale.getString('common.export_selection'),'code':'EXPORT'});


    $scope.transponderSystems = [];
    $scope.currentMobileTerminal = undefined;

    //Toggle (show/hide) new mobile terminal
    $scope.toggleAddNewMobileTerminal = function(noHideMessage){
        $scope.createNewMode = true;
        toggleMobileTerminalForm(new MobileTerminal(), noHideMessage);
    };

    //Toggle (show/hide) viewing of a mobile terminal
    $scope.toggleMobileTerminalDetails = function(mobileTerminal, noHideMessage){
        $scope.createNewMode = false;
        if (mobileTerminal) {
            mobileTerminal = mobileTerminal.copy();
        }

        toggleMobileTerminalForm(mobileTerminal, noHideMessage);
    };

    var toggleMobileTerminalForm = function(mobileTerminal, noHideMessage){
        if (!noHideMessage) {
            alertService.hideMessage();
        }

        if(angular.isDefined(mobileTerminal)){
            $scope.currentMobileTerminal = mobileTerminal;
        }

        $scope.isVisible.search = !$scope.isVisible.search;
        $scope.isVisible.mobileTerminalForm = !$scope.isVisible.mobileTerminalForm;
    };

    //Is user allowed to edit terminals?
    $scope.allowedToEditMobileTerminals = function(){
        return checkAccessToFeature('manageMobileTerminals');
    };

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool, reload){
        $scope.createNewMode = bool;
        if (reload) {
            $scope.currentSearchResults.sortBy = '';
            $scope.searchMobileTerminals();
        }
    };

    $scope.getCurrentMobileTerminal = function(bool){
        return $scope.currentMobileTerminal;
    };

    //Get model value for the transponder system dropdown by system type and plugin
    $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin = function(type, labelName, serviceName){
        var value, tmp;
        $.each($scope.transponderSystems, function(index, system){
            var systemAndTypeAndPluginItem = system.typeAndPlugin;
            tmp = new SystemTypeAndPlugin(type, labelName, serviceName);
            if(systemAndTypeAndPluginItem.equals(tmp)){
                value = systemAndTypeAndPluginItem;
                return false;
            }
        });
        return value;
    };

    //Create dropdown for transponder system
    $scope.createTransponderSystemDropdownOptions = function(){
        //Create dropdown values
        $.each($scope.transpondersConfig.terminalConfigs, function(key, config){
            //LES capability
            if(config.capabilities["PLUGIN"] && _.isArray(config.capabilities["PLUGIN"])){
                $.each(config.capabilities["PLUGIN"], function(key2, pluginOption){
                    $scope.transponderSystems.push({text : config.viewName +" : " +pluginOption.text, typeAndPlugin : new SystemTypeAndPlugin(config.systemType, pluginOption.attributes['LABELNAME'], pluginOption.attributes['SERVICENAME'])});
                });
            }else{
                $scope.transponderSystems.push({text : config.viewName, typeAndPlugin : new SystemTypeAndPlugin(config.systemType, undefined)});
            }
        });
    };

    //Init function when entering mobile terminal page
    var init = function(){
        searchService.reset();

        //GET mobileterminal GUID from URL and load details for that MobileTerminal
        var mobileTerminalGUID = $stateParams.id;
        if(angular.isDefined(mobileTerminalGUID)){
            mobileTerminalRestService.getMobileTerminalByGuid(mobileTerminalGUID).then(
                function(mobileTerminal){
                    $scope.toggleMobileTerminalDetails(mobileTerminal, false);
                    searchService.getAdvancedSearchObject().IRCS = mobileTerminal.associatedVessel.ircs;
                    searchService.getAdvancedSearchObject().NAME = mobileTerminal.associatedVessel.name;
                    searchService.setSearchCriteriasToAdvancedSearch();

                    //Load list with mobileTerminals
                    $scope.searchMobileTerminals();
                },
                function(error){
                    console.error("Error loading details for mobile terminal with GUID: " +mobileTerminalGUID);
                    alertService.showErrorMessage(locale.getString('mobileTerminal.view_terminal_on_failed_to_load_error'));
                    $scope.searchMobileTerminals();
                }
            );
        }
        else{
            //Load list with mobileTerminals
            $scope.searchMobileTerminals();
        }

        //Get list transponder systems
        if(angular.isDefined(configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS'))){
            $scope.transpondersConfig = configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS');
            $scope.createTransponderSystemDropdownOptions();
        }else{
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
        }
    };

    //Get list of Mobile Terminals matching the current search criterias
    $scope.searchMobileTerminals = function(){
        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        searchService.searchMobileTerminals(false)
                .then(updateSearchResults, onGetSearchResultsError);
    };

    //Update the search results
    var updateSearchResults = function(searchResultsListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);
        $scope.allCurrentSearchResults = searchResultsListPage.items;
        $scope.currentSearchResultsByPage = searchResultsListPage.items;
    };

    $scope.getOriginalMobileTerminal = function() {
        if (!$scope.currentMobileTerminal) {
            return;
        }

        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            if ($scope.currentSearchResults.items[i].isEqualTerminal($scope.currentMobileTerminal)) {
                return $scope.currentSearchResults.items[i];
            }
        }
    };

    $scope.mergeCurrentMobileTerminalIntoSearchResults = function() {
        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            if ($scope.currentSearchResults.items[i].isEqualTerminal($scope.currentMobileTerminal)) {
                $scope.currentSearchResults.items[i] = $scope.currentMobileTerminal;
                $scope.currentMobileTerminal = $scope.currentSearchResults.items[i].copy();
            }
        }
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchMobileTerminals();
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.allCurrentSearchResults = $scope.currentSearchResults.items;
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };


    //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedMobileTerminals = [];
    };

    //Add a mobile terminal to the selection
    $scope.addToSelection = function(item){
        $scope.selectedMobileTerminals.push(item);
    };

    //Remove a mobile terminal from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedMobileTerminals, function(index, mobileTerminal){
            if(mobileTerminal.isEqualTerminal(item)){
                $scope.selectedMobileTerminals.splice(index, 1);
                return false;
            }
        });
    };

    //Remove the current terminal from the search result
    $scope.removeCurrentMobileTerminalFromSearchResults = function() {
        var terminalsInList = $scope.currentSearchResults.items;
        var index;
        for (var i = 0; i < terminalsInList.length; i++) {
            if (terminalsInList[i].isEqualTerminal($scope.currentMobileTerminal)) {
                index = i;
            }
        }
        //Remove vessel from list
        if(angular.isDefined(index)){
            $scope.currentSearchResults.items.splice(index, 1);
            $scope.currentMobileTerminal = undefined;
        }

        //Removed last terminal from list?
        if($scope.currentSearchResults.items.length === 0){
            $scope.searchMobileTerminals();
        }
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedMobileTerminals.length){
            //Poll selected temrinals
            if(selectedItem.code === 'POLL'){
                alertService.hideMessage();
                //Add selected terminals to poll selection and go to polling page
                if($scope.selectedMobileTerminals.length > 0){
                    pollingService.clearSelection();

                    //Create a GetPollabeListRequest to get the pollable channels
                    var getPollableListRequest = new GetPollableListRequest();
                    getPollableListRequest.listSize = $scope.selectedMobileTerminals.length;

                    $.each($scope.selectedMobileTerminals, function(index, item){
                        //Only add mobile terminals that are assigned to a carrier
                        if(angular.isDefined(item.connectId)){
                            getPollableListRequest.addConnectId(item.connectId);
                        }
                    });

                    if(getPollableListRequest.connectIds.length > 0){
                        pollingRestService.getPollablesMobileTerminal(getPollableListRequest).then(
                            function(searchResultListPage){
                                if(searchResultListPage.getNumberOfItems() === 0){
                                    alertService.showInfoMessage(locale.getString('mobileTerminal.add_mobile_terminal_to_polling_zero_items_added_error', {selected :$scope.selectedMobileTerminals.length}));
                                }else{
                                    //Add each pollChannel to the selection
                                    $.each(searchResultListPage.items, function(index, item){
                                        pollingService.addMobileTerminalToSelection(item);
                                    });

                                    //Show alert message if not all selected mobile terminals could be added to polling
                                    if(searchResultListPage.getNumberOfItems() !== $scope.selectedMobileTerminals.length){
                                        alertService.showInfoMessage(locale.getString('mobileTerminal.add_mobile_terminal_to_polling_only_some_were_addded_message', {selected :$scope.selectedMobileTerminals.length, pollable : searchResultListPage.getNumberOfItems()}));
                                        $scope.hideAlertsOnScopeDestroy = false;
                                    }

                                    pollingService.setWizardStep(2);
                                    $location.path('polling');
                                }
                            },
                            function(error){
                                console.error("Error getting pollable channels.");
                            }
                        );
                    }
                }
            }else if(selectedItem.code === 'EXPORT'){
                $scope.exportTerminalsAsCSVFile(true);
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    //Export data as CSV file
    $scope.exportTerminalsAsCSVFile = function(onlySelectedItems){
        var filename = 'mobileTerminals.csv';

        //Set the header columns
        var header = [
            locale.getString('mobileTerminal.table_header_vessel_name'),
            locale.getString('mobileTerminal.table_header_serial_no'),
            locale.getString('mobileTerminal.table_header_member_no'),
            locale.getString('mobileTerminal.table_header_dnid'),
            locale.getString('mobileTerminal.table_header_transponder_type'),
            locale.getString('mobileTerminal.table_header_satellite_number'),
            locale.getString('mobileTerminal.table_header_mmsi_no'),
            locale.getString('mobileTerminal.table_header_status')
        ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.selectedMobileTerminals;
            }
            //Export items in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                        item.associatedVessel? item.associatedVessel.name : locale.getString('mobileTerminal.table_vessel_name_not_assigned'),
                        item.attributes.SERIAL_NUMBER,
                        item.channels[0].ids.MEMBER_NUMBER,
                        item.channels[0].ids.DNID,
                        $filter('transponderName')(item.type),
                        item.attributes.SATELLITE_NUMBER,
                        item.associatedVessel? item.associatedVessel.mmsiNo : '',
                        item.active? locale.getString('common.active') : locale.getString('common.inactive')
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
        if($scope.hideAlertsOnScopeDestroy){
            alertService.hideMessage();
        }
    });

    $scope.$on("createMobileTerminalWithVessel", function(e) {
        $scope.$emit($scope.toggleAddNewMobileTerminal());
        $scope.createMobileTerminalWithVessel.visible = !$scope.createMobileTerminalWithVessel.visible;
    });

    init();
});
