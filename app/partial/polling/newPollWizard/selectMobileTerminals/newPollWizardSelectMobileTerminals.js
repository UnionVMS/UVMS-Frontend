angular.module('unionvmsWeb').controller('NewpollwizardselectmobileterminalsCtrl',function($scope, searchService, pollingService, alertService, MobileTerminal, mobileTerminalRestService, locale, MobileTerminalGroup, pollingRestService, SearchResults){


    $scope.selectedGroup = {};

    $scope.currentSearchResults = new SearchResults('vesselName', false);

    var init = function(){
        $scope.getPollableChannels();
    };

    $scope.getPollableChannels = function(opt){

        $scope.selectedGroup = opt || {};
        searchService.setDynamic(true);
        if (opt) {
            searchService.setDynamic(opt.savedSearchGroup.dynamic);
        }

        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        searchService.searchForPollableTerminals()
                .then(updateSearchResults, onGetSearchResultsError);
    };

    //Update the search results
    var updateSearchResults = function(searchResultListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultListPage);
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //button to add selected vessel
    $scope.selectChannel = function(item, index){
        pollingService.addMobileTerminalToSelection(item);
    };

    //button to remove selected vessel
    $scope.unselectChannel = function(item, index){
        pollingService.removeMobileTerminalFromSelection(undefined, item);
    };


    //Select all mobileterminals
    $scope.selectAllVessels = function(){
        var i;
        if(!$.isEmptyObject($scope.selectedGroup)){
            //create vesselgroup
            var mobileTerminalGroup = new MobileTerminalGroup();
            mobileTerminalGroup.name = $scope.selectedGroup.savedSearchGroup.name;

            mobileTerminalGroup.mobileTerminals = []; // $scope.currentSearchResults;
            for (i = 0; i < $scope.currentSearchResults.items.length; i++) {
                mobileTerminalGroup.mobileTerminals.push($scope.currentSearchResults.items[i]);
            }
            //Add terminalgroup.
            pollingService.addMobileTerminalGroupToSelection(mobileTerminalGroup);
        }else{
            //Add terminals as not a group.
            for(i=0; i < $scope.currentSearchResults.items.length; i++){
                pollingService.addMobileTerminalToSelection($scope.currentSearchResults.items[i]);
            }
        }
    };

    $scope.addToSelectedMobileTerminals = function(item){
        if($.inArray(item, $scope.selectedMobileTerminals) < 0) {
            //add to array
            $scope.selectedMobileTerminals.push(item);
        }
    };

    $scope.isTerminalGroupSelected = function(){

        var bol = true;
        for(var i=0; i < $scope.currentSearchResults.items.length; i++){
           if (pollingService.isMobileTerminalSelected($scope.currentSearchResults.items[i]) === false){
                bol = false;
            }
        }
        return bol;
    };

    $scope.isTerminalSelected = function(item){
      return pollingService.isMobileTerminalSelected(item);
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.getPollableChannels();
        }
    };

    $scope.readyForNextStep = function(){
        return (pollingService.getNumberOfSelectedTerminals() > 0 ) ? true : false;
    };

    init();

});