angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, locale, savedSearchService, GetListRequest, searchService, vesselRestService, alertService){

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        createNewVessel : false,
        viewVessel : false
    };

    //Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        vessels : [],
        loading: true
    };

    //Selected by checkboxes
    $scope.selectedVessels = [];

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.save_as_group'), code : 'SAVE'},
        {text:locale.getString('common.view_on_map'), code : 'MAP'},
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];

    //Current filter and sorting for the results table
    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';


    //Init function when entering page
    var init = function(){
        //Load list with vessels
        var response = searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);

    };

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
        var response = searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);

        }
    };

    //Callback for the search
    $scope.searchCallback = function(vesselListPage){
        $scope.currentSearchResults.vessels.length = 0;

        //Success?
        if(vesselListPage.vessels !== undefined){
            updateSearchResults(vesselListPage);
        }else{
            onGetSearchResultsError();
        }

    };

    //Update the search results
    var updateSearchResults = function(vesselListPage){
        $scope.vesselListPage = vesselListPage;
        if(vesselListPage.vessels.length === 0 ){
            $scope.error = "No vessels matching you search criteria was found.";
        } else {
            $scope.error = "";
            if(!$scope.currentSearchResults.vessels){
                $scope.currentSearchResults.vessels = vesselListPage.vessels;
            }
            else {
                for (var i = 0; i < vesselListPage.vessels.length; i++){
                    $scope.currentSearchResults.vessels.push(vesselListPage.vessels[i]);
                }
            }
        }
        //Update page info
        $scope.currentSearchResults.totalNumberOfPages = vesselListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = vesselListPage.currentPage;
        $scope.currentSearchResults.loading = false;
    };

    //Handle error from search results (listing vessel)
    var onGetSearchResultsError = function(response){
        $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");

        $scope.currentSearchResults.totalNumberOfPages = 1;
        $scope.currentSearchResults.page = 1;
    };


    //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedVessels = [];
    };

    //Add a vessel to the selection
    $scope.addToSelection = function(item){
        $scope.selectedVessels.push(item);
    };

    //Remove a vessel from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedVessels, function(index, vessel){
            if(vessel.equals(item)){
                $scope.selectedVessels.splice(index, 1);
                return false;
            }
        });
    };

    //Toggle create new vessel
    $scope.toggleCreateNewVessel = function(){
        $scope.isVisible.createNewVessel = !$scope.isVisible.createNewVessel;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    //Toggle viewing of a vessel
    $scope.toggleViewVessel = function(item){
        if(item === undefined){
            $scope.vesselObj = undefined;
        }
        else
        {
            //creating dummy for mobileterminals... Should be removed when there is support in backend for mobile terminals.
            var mobileTerminals = [];
            item.mobileTerminals = mobileTerminals;
            $scope.vesselObj = item;
        }
        $scope.isVisible.viewVessel = !$scope.isVisible.viewVessel;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        //Poll selected temrinals
        if(selectedItem.code === 'SAVE'){
            savedSearchService.openSaveSearchModal("VESSEL", false, $scope.selectedVessels);            
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
