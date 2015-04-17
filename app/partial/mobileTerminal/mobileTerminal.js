angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale){

    $scope.currentSearchResults = new MobileTerminalListPage();

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
        mobileTerminals : []
    };    

    $scope.editSelectionDropdownItems =[{'text':'Poll terminals','code':'POLL'}, {'text':'Export selection','code':'EXPORT'}];
    $scope.transponderSystems = [];
    $scope.currentMobileTerminal = undefined;

    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        console.log("search results!");
        console.log(vesselListPage);
    };

    $scope.toggleAddNewMobileTerminal = function(){
        alertService.hideMessage();
        $scope.currentMobileTerminal = new MobileTerminal();
        $scope.isVisible.addNewMobileTerminal = !$scope.isVisible.addNewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;        
    };

    $scope.toggleMobileTerminalDetails = function(item){
        console.log(item);
        $scope.currentMobileTerminal = item;
        console.log($scope.currentMobileTerminal);
        $scope.isVisible.viewMobileTerminal = !$scope.isVisible.viewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    $scope.selectedItem = "";

    //Init function when entering page
    var init = function(){
        //Load list with mobileTerminals
        var response = searchService.searchMobileTerminals()
            .then(updateSearchResults, onGetSearchResultsError);

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

    //Update the search results
    var updateSearchResults = function(mobileTerminalListPage){
        $scope.mobileTerminalListPage = mobileTerminalListPage;
        if(mobileTerminalListPage.mobileTerminals.length === 0 ){
            $scope.error = "No mobile terminals matching you search criteria was found.";
        } else {
            $scope.error = "";
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
        var response = searchService.searchMobileTerminals()
            .then(updateSearchResults, onGetSearchResultsError);
        }
    };


    var onGetSearchResultsError = function(error){
        $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");

        $scope.currentSearchResults.totalNumberOfPages = 1;
        $scope.currentSearchResults.page = 1;
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});
