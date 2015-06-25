angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService, MobileTerminalListPage, MobileTerminal, SystemTypeAndLES, mobileTerminalRestService, pollingService, $location, locale, $routeParams){

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        mobileTerminalForm : false
    };

    //Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        mobileTerminals : [],
        errorMessage : "",
        loading : false,
        sortBy : "attributes.SERIAL_NUMBER",
        sortReverse : false
    };

    //Selected by checkboxes
    $scope.selectedMobileTerminals = [];

    $scope.editSelectionDropdownItems =[{'text':'Poll terminals','code':'POLL'}, {'text':'Export selection','code':'EXPORT'}];
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
        var mobileTerminalGUID = $routeParams.id;
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
                }
            );
        }
        else{
            //Load list with mobileTerminals
            $scope.searchMobileTerminals();
        }



        //Get list transponder systems
        mobileTerminalRestService.getTranspondersConfig()
        .then(
            function(transpConfig){
                $scope.transpondersConfig = transpConfig;
                $scope.createTransponderSystemDropdownOptions();
            },
            function(error){
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
            }
        );
        //Get list of channelNames
        mobileTerminalRestService.getChannelNames()
        .then(
            function(channelNamesList){
                $scope.channelNames = [];
                $.each(channelNamesList, function(index, name){
                    $scope.channelNames.push({text : name, code : name});
                });
            },
            function(error){
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_channel_names_error'));
            }
        );
        
    }; 

    //Get list of Mobile Terminals matching the current search criterias
    $scope.searchMobileTerminals = function(){
        $scope.clearSelection();
        $scope.currentSearchResults.errorMessage = "";
        $scope.currentSearchResults.loading = true;
        $scope.currentSearchResults.mobileTerminals.length = 0;
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        searchService.searchMobileTerminals(false)
                .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(mobileTerminalListPage){
        $scope.currentSearchResults.loading = false;
        if(mobileTerminalListPage.totalNumberOfPages === 0 ){
            $scope.currentSearchResults.errorMessage = locale.getString('mobileTerminal.search_zero_results_error');
        } else {
            $scope.currentSearchResults.errorMessage = "";
            if(!$scope.currentSearchResults.mobileTerminals){
                $scope.currentSearchResults.mobileTerminals = mobileTerminalListPage.mobileTerminals;
            }
            else {
                for (var i = 0; i < mobileTerminalListPage.mobileTerminals.length; i++){
                    $scope.currentSearchResults.mobileTerminals.push(mobileTerminalListPage.mobileTerminals[i]);
                }
            }
        }
        //Update page info
        $scope.currentSearchResults.totalNumberOfPages = mobileTerminalListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = mobileTerminalListPage.currentPage;
    };

    $scope.getOriginalMobileTerminal = function() {
        if (!$scope.currentMobileTerminal) {
            return;
        }

        for (var i = 0; i < $scope.currentSearchResults.mobileTerminals.length; i++) {
            if ($scope.currentSearchResults.mobileTerminals[i].isEqualTerminal($scope.currentMobileTerminal)) {
                return $scope.currentSearchResults.mobileTerminals[i];
            }
        }
    };

    $scope.mergeCurrentMobileTerminalIntoSearchResults = function() {
        for (var i = 0; i < $scope.currentSearchResults.mobileTerminals.length; i++) {
            if ($scope.currentSearchResults.mobileTerminals[i].isEqualTerminal($scope.currentMobileTerminal)) {
                $scope.currentSearchResults.mobileTerminals[i] = $scope.currentMobileTerminal;
                $scope.currentMobileTerminal = $scope.currentSearchResults.mobileTerminals[i].copy();
            }
        }
    };

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            var response = searchService.searchMobileTerminals(true)
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
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
                $.each($scope.selectedMobileTerminals, function(index, item){
                    //Only add mobile terminals that are assigned to a carrier
                    if(angular.isDefined(item.connectId)){
                        pollingService.addMobileTerminalToSelection(item);
                    }
                });
                pollingService.setWizardStep(2);
                $location.path('communication/polling');
            }
        }else if(selectedItem.code === 'EXPORT'){
            alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
        }
        $scope.editSelection = "";
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});
