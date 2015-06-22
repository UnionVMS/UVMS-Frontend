angular.module('unionvmsWeb').controller('NewpollwizardselectmobileterminalsCtrl',function($scope, searchService, pollingService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale, MobileTerminalGroup, pollingRestService){

	
    $scope.selectedGroup = {};
    

	//Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        pollableChannels : [],
        errorMessage : "",
        loading : false,
        sortBy : "vesselName",
        sortReverse : false
    };  
    
    var init = function(){
        $scope.getPollableChannels();
    };

    $scope.getPollableChannels = function(opt){

        $scope.selectedGroup = opt || {};
        searchService.setDynamic(true);
        if (opt) {
            searchService.setDynamic(opt.savedSearchGroup.dynamic);
        }
        
        $scope.currentSearchResults.errorMessage = "";
        $scope.currentSearchResults.loading = true;
        $scope.currentSearchResults.pollableChannels.length = 0;
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        
        searchService.searchForPollableTerminals()
                .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(searchResultListPage){
        $scope.currentSearchResults.loading = false;
        if(searchResultListPage.totalNumberOfPages === 0 ){
            $scope.currentSearchResults.errorMessage = locale.getString('mobileTerminal.search_zero_results_error');
        } else {
            $scope.currentSearchResults.errorMessage = "";
            if(!$scope.currentSearchResults.pollableChannels){
                $scope.currentSearchResults.pollableChannels = searchResultListPage.items;
            }
            else {
                for (var i = 0; i < searchResultListPage.items.length; i++){
                    $scope.currentSearchResults.pollableChannels.push(searchResultListPage.items[i]);
                }
            }
        }
        //Update page info
        $scope.currentSearchResults.totalNumberOfPages = searchResultListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = searchResultListPage.currentPage;
    }; 

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };

    //button to add selected vessel    
    $scope.selectChannel = function(item, index){
        pollingService.addMobileTerminalToSelection(item);
    };
    
    
    //Select all mobileterminals
    $scope.selectAllVessels = function(){ 
        var i;
        if(!$.isEmptyObject($scope.selectedGroup)){
            //create vesselgroup 
            var mobileTerminalGroup = new MobileTerminalGroup();
            mobileTerminalGroup.name = $scope.selectedGroup.savedSearchGroup.name;
            
            mobileTerminalGroup.mobileTerminals = []; // $scope.currentSearchResults;
            for (i = 0; i < $scope.currentSearchResults.pollableChannels.length; i++) {
                mobileTerminalGroup.mobileTerminals.push($scope.currentSearchResults.pollableChannels[i]);
            }
            //Add terminalgroup.
            pollingService.addMobileTerminalGroupToSelection(mobileTerminalGroup);
        }else{
            //Add terminals as not a group.
            for(i=0; i < $scope.currentSearchResults.pollableChannels.length; i++){
                pollingService.addMobileTerminalToSelection($scope.currentSearchResults.pollableChannels[i]);
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
        for(var i=0; i < $scope.currentSearchResults.pollableChannels.length; i++){
           if (pollingService.isMobileTerminalSelected($scope.currentSearchResults.pollableChannels[i]) === false){
                bol = false;
            }
        }
        return bol;
    };

    $scope.isTerminalSelected = function(item){
      return pollingService.isMobileTerminalSelected(item);
    };

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            searchService.searchForPollableTerminals().then(updateSearchResults, onGetSearchResultsError);
        }
    };

    $scope.readyForNextStep = function(){
        return (pollingService.getNumberOfSelectedTerminals() > 0 ) ? true : false;
    };  

    init();

});