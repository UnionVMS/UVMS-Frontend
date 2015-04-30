angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale){

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        addNewMobileTerminal : false,
        viewMobileTerminal : false
    };

    //Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        mobileTerminals : [],
        errorMessage : "",
        loading : false,
        sortBy : "",
        sortReverse : ""
    };    

    $scope.editSelectionDropdownItems =[{'text':'Poll terminals','code':'POLL'}, {'text':'Export selection','code':'EXPORT'}];
    $scope.transponderSystems = [];
    $scope.currentMobileTerminal = undefined;

    //Toggle (show/hide) new mobile terminal
    $scope.toggleAddNewMobileTerminal = function(noHideMessage){
        if (!noHideMessage) {
            alertService.hideMessage();
        }

        $scope.currentMobileTerminal = new MobileTerminal();
        $scope.isVisible.addNewMobileTerminal = !$scope.isVisible.addNewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;        
    };

    //Toggle (show/hide) viewing of a mobile terminal
    $scope.toggleMobileTerminalDetails = function(item, noHideMessage){
        if (!noHideMessage) {
            alertService.hideMessage();
        }

        $scope.currentMobileTerminal = item;
        $scope.isVisible.viewMobileTerminal = !$scope.isVisible.viewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    $scope.selectedItem = "";

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

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});
