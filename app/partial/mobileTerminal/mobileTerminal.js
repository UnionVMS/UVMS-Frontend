angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, pollingService, $location, locale){

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

    //Init function when entering page
    var init = function(){
        //Load list with mobileTerminals
        $scope.searchMobileTerminals();

        //Get list transponder systems
        mobileTerminalRestService.getTranspondersConfig()
        .then(
            function(transpConfig){
                $scope.transpondersConfig = transpConfig;
                //Create dropdown values
                $.each(transpConfig.terminalConfigs, function(key, config){
                    $scope.transponderSystems.push({text : config.viewName, code : config.systemType});
                });
            },
            function(error){
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
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
                    if(angular.isDefined(item.carrierId)){
                        pollingService.addMobileTerminalToSelection(item);
                    }
                });
                pollingService.setWizardStep(2);
                $location.path('communication/polling');
            }
        }else if(selectedItem.code === 'EXPORT'){
            alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
        }
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});
