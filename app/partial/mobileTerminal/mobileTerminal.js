angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, $filter, searchService, alertService, MobileTerminal, SystemTypeAndLES, mobileTerminalRestService, pollingService, GetPollableListRequest, pollingRestService, configurationService, $location, locale, $stateParams, csvService, SearchResults, userService){

    var hideAlertsOnScopeDestroy = true;

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        mobileTerminalForm : false
    };

    $scope.currentSearchResults = new SearchResults('attributes.SERIAL_NUMBER', false, locale.getString('mobileTerminal.search_zero_results_error'));

    //Selected by checkboxes
    $scope.selectedMobileTerminals = [];

    //Edit dropdown
    $scope.editSelectionDropdownItems = [];    
    if(checkAccessToFeature('managePolls')){
        $scope.editSelectionDropdownItems.push({'text':locale.getString('mobileTerminal.edit_selection_poll_terminals'),'code':'POLL'});
    }
    $scope.editSelectionDropdownItems.push({'text':locale.getString('common.export_selection'),'code':'EXPORT'});


    $scope.transponderSystems = [];
    $scope.channelNames = [];
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

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool){
        $scope.createNewMode = bool;
    };

    $scope.getCurrentMobileTerminal = function(bool){
        return $scope.currentMobileTerminal;
    };    

    //Get model value for the transponder system dropdown by system type and les
    $scope.getModelValueForTransponderSystemBySystemTypeAndLES = function(type, les){
        var value;
        $.each($scope.transponderSystems, function(index, system){
            var systemAndTypeAndLESItem = system.typeAndLes;
            if(systemAndTypeAndLESItem.equalsTypeAndLES(type, les)){
                value = systemAndTypeAndLESItem;
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
            if(config.capabilities["HAS_LES"] && _.isArray(config.capabilities["HAS_LES"])){
                $.each(config.capabilities["HAS_LES"], function(key2, lesOption){
                    $scope.transponderSystems.push({text : config.viewName +" - " +lesOption.text, typeAndLes : new SystemTypeAndLES(config.systemType, lesOption.code)});
                });
            }else{
                $scope.transponderSystems.push({text : config.viewName, typeAndLes : new SystemTypeAndLES(config.systemType, undefined)});
            }
        });
    };

    //Init function when entering page
    var init = function(){

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

        //Get list of channelNames
        $scope.channelNames = [];
        if(angular.isDefined(configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS'))){
            $.each(configurationService.getConfig('MOBILE_TERMINAL_CHANNELS'), function(index, name){
                $scope.channelNames.push({text : name, code : name});
            });        
        }else{
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_channel_names_error'));
        }
    }; 

    //Get list of Mobile Terminals matching the current search criterias
    $scope.searchMobileTerminals = function(){
        $scope.clearSelection();
        $scope.currentSearchResults.clearForSearch();        
        searchService.searchMobileTerminals(false)
                .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(searchResultsListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);
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

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.setLoading(true);
            var response = searchService.searchMobileTerminals(true)
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
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

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        //Poll selected temrinals
        if(selectedItem.code === 'POLL'){
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
                            //Add each pollChannel to the selection
                            $.each(searchResultListPage.items, function(index, item){
                                pollingService.addMobileTerminalToSelection(item);
                            });

                            //Show alert message if not all selected mobile terminals could be added to polling
                            if(searchResultListPage.getNumberOfItems() !== $scope.selectedMobileTerminals.length){
                                alertService.showInfoMessage(locale.getString('mobileTerminal.add_mobile_terminal_to_polling_only_some_were_addded_message', {selected :$scope.selectedMobileTerminals.length, pollable : searchResultListPage.getNumberOfItems()}));
                                hideAlertsOnScopeDestroy = false;
                            }

                            pollingService.setWizardStep(2);
                            $location.path('communication/polling');                                

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
        $scope.editSelection = "";
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
        if(hideAlertsOnScopeDestroy){
            alertService.hideMessage();
        }
        searchService.reset();
    });

    init();

});
