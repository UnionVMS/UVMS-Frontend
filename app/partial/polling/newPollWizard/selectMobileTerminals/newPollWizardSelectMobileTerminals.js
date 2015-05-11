angular.module('unionvmsWeb').controller('NewpollwizardselectmobileterminalsCtrl',function($scope, searchService, pollingService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale, MobileTerminalGroup){

	
    $scope.selectedGroup = {};
   

	console.log($scope.vesselGroups); 

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

    var init = function(){
        $scope.searchMobileTerminals();
    };

    //Get list of Mobile Terminals matching the current search criterias
    $scope.searchMobileTerminals = function(opt){

        $scope.selectedGroup = opt || {};

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

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };

    //button to add selected vessel    
    $scope.selectVessel = function(item, index){
        console.log("index: " + index);
        pollingService.addMobileTerminalToSelection(item);
      //  $scope.addToSelectedMobileTerminals(item);
    };
    
    
    //Select all mobileterminals
    $scope.selectAllVessels = function(){ 
        var i;
        if(!$.isEmptyObject($scope.selectedGroup)){
            //create vesselgroup 
            var mobileTerminalGroup = new MobileTerminalGroup();
            mobileTerminalGroup.name = $scope.selectedGroup.savedSearchGroup.name;
            
            mobileTerminalGroup.mobileTerminals = []; // $scope.currentSearchResults;
            for (i = 0; i < $scope.currentSearchResults.mobileTerminals.length; i++) {
                mobileTerminalGroup.mobileTerminals.push($scope.currentSearchResults.mobileTerminals[i]);
                 //$scope.addToSelectedMobileTerminals($scope.currentSearchResults.mobileTerminals[i]);
            }
            //Add terminalgroup.
            pollingService.addMobileTerminalGroupToSelection(mobileTerminalGroup);
        }else{
            //Add terminals as not a group.
            for(i=0; i < $scope.currentSearchResults.mobileTerminals.length; i++){
                pollingService.addMobileTerminalToSelection($scope.currentSearchResults.mobileTerminals[i]);
                //$scope.addToSelectedMobileTerminals($scope.currentSearchResults.mobileTerminals[i]);
            }
        }
    };

    $scope.addToSelectedMobileTerminals = function(item){
        if($.inArray(item, $scope.selectedMobileTerminals) < 0) {
            //add to array
            $scope.selectedMobileTerminals.push(item);
        }
        console.info($scope.selectedMobileTerminals);
    };
    
    $scope.isTerminalGroupSelected = function(){
        
        var bol = true; 
        for(var i=0; i < $scope.currentSearchResults.mobileTerminals.length; i++){
           if (pollingService.isMobileTerminalSelected($scope.currentSearchResults.mobileTerminals[i]) === false){
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
            var response = searchService.searchMobileTerminals(true)
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    $scope.readyForNextStep = function(){
        return (pollingService.getNumberOfSelectedTerminals() > 0 ) ? true : false;
    };  
   

    init();

});