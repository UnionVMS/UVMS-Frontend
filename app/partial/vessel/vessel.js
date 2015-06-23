angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, locale, savedSearchService, Vessel, GetListRequest, searchService, vesselRestService, alertService){

    //Keep track of visibility statuses
    $scope.isVisible = {
        search : true,
        vesselForm : false
    };

    //Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        vessels : [],
        errorMessage : "",
        loading : false,
        sortBy : "state",
        sortReverse : false,
        filter : ""
    };

    //Selected by checkboxes
    $scope.selectedVessels = [];

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.save_as_group'), code : 'SAVE'},
        {text:locale.getString('common.view_on_map'), code : 'MAP'},
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];


    //Init function when entering page
    var init = function(){
        //Load list with vessels
        $scope.searchVessels();
    };

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    $scope.resetSearchResult = function(){      
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.vessels = [];
        $scope.currentSearchResults.errorMessage ="";
        $scope.currentSearchResults.loading = true;
    };

    $scope.searchVessels = function(){
        $scope.resetSearchResult();
        searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(vesselListPage){
        $scope.vesselListPage = vesselListPage;
        if(vesselListPage.vessels.length === 0 ){
            $scope.currentSearchResults.errorMessage = "No vessels matching you search criteria was found.";
        } else {
            $scope.currentSearchResults.errorMessage = "";
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
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
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

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool){
        $scope.createNewMode = bool;
    };    

    $scope.getVesselObj = function(){
        return $scope.vesselObj;
    };     

    //Toggle create new vessel
    $scope.toggleCreateNewVessel = function(){        
        $scope.createNewMode = true;
        toggleVesselForm(new Vessel());
    };

    //Toggle viewing of a vessel
    $scope.toggleViewVessel = function(item){
        $scope.createNewMode = false;
        toggleVesselForm(item);
    };

    var toggleVesselForm = function(vessel){
        $scope.vesselObj = vessel;
        alertService.hideMessage();
        $scope.isVisible.vesselForm = !$scope.isVisible.vesselForm;
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
