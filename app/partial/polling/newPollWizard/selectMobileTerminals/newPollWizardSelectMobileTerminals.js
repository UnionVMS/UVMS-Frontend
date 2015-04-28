angular.module('unionvmsWeb').controller('NewpollwizardselectmobileterminalsCtrl',function($scope, searchService, alertService,MobileTerminalListPage, MobileTerminal, mobileTerminalRestService, locale){

	$scope.selectAllVessels = function(){
		console.log("ADD ALL VESSELS TO LIST!");
	};

	$scope.selectedVesselsToPoll = [];

	console.log("sdfs");
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

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };


    //button to add selected vessel    
    $scope.selectVessel = function(item){
        console.info("SELECTED VESSEL IS: " + item + " ADD THIS TO SELECTED VESSELS");
    };

    $scope.removeSelectVessel = function(item){
        console.info("THE SELECTED VESSEL TO REMOVE IS : " + item + " REMOVE THIS FROM SELECTED VESSELS");
    };



});