angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale){

    $scope.currentSearchResults = new MobileTerminalListPage();

    $scope.isVisible = {
        search : true,
        addNewMobileTerminal : false,
        viewMobileTerminal : false
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
        //Load list with vessels
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

    var updateSearchResults = function(mobileTerminalListPage){
        $scope.currentSearchResults = mobileTerminalListPage.mobileTerminals;
    };

    var onGetSearchResultsError = function(error){
        console.log(error);
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
    });

    init();

});
