angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $modal, GetListRequest, searchService, vesselRestService, alertService, locale){

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

    //Current filter and sorting for the results table
    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';

    $scope.vesselGroups = [];

    //Init function when entering page
    var init = function(){
        //Load list with vessels
        var response = searchService.searchVessels()
            .then(updateSearchResults, onGetSearchResultsError);

        //Get all vesselGroups for the user
        $scope.getVesselGroupsForUser();
    };

    //Get all vessel groups that belongs to the user
    $scope.getVesselGroupsForUser = function(){
        //Load list of VesselGroups
        vesselRestService.getVesselGroupsForUser()
        .then(onVesselGroupListSuccess, onVesselGroupListError);
    };

    //Success getting vesselGroups for the user
    var onVesselGroupListSuccess = function(groups){
        $scope.vesselGroups = groups;
    };

    //Handle error when getting vesselGroups for the user
    var onVesselGroupListError = function(response){
        $scope.currentSearchResults.loading = false;
        $scope.error = locale.getString('common.search_zero_results_error');
        console.error("We are sorry... To err is human but to arr is pirate!!");
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

    //Callback from the search when a search has been saved to a vesselGroup
    $scope.saveGroupCallback = function(vesselListPage){
        $scope.getVesselGroupsForUser();
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


    //Check all vessels in the result list
    $scope.checkAll = function(){
        if($scope.selectedAll)
        {
            $scope.selectedAll = false;
            delete $scope.selectedVessels;
            angular.forEach($scope.currentSearchResults.vessels, function(item) {
                item.Selected = $scope.selectedAll;
            });
        } else {
            $scope.selectedAll = true;
            $scope.selectedVessels = [];
            angular.forEach($scope.currentSearchResults.vessels, function(item) {
                item.Selected = $scope.selectedAll;
                $scope.selectedVessels.push(item.vesselId.value);
            });
        }
    };

    //Check one vessel in the result list
    $scope.checkedVessel = function(item){
        $scope.selectedVessels = [];

        item.Selected = !item.Selected;

        angular.forEach($scope.currentSearchResults.vessels, function(item) {
            if(item.Selected){
                $scope.selectedVessels.push(item.vesselId.value);
            }
        });
    };

    //Open modal for saving a selection of vessels to a vesselGroup
    $scope.openSelectedSaveGroupModal = function() {
        var modalInstance = $modal.open({
            templateUrl: 'partial/vessel/saveVesselGroupModal/saveVesselGroupModal.html',
            controller: 'SaveVesselGroupModalInstanceCtrl',
            windowClass: "saveVesselGroupModal",
            size: "small",
            resolve: {
                savedGroups: function(){
                    return $scope.vesselGroups;
                },
                advancedSearchClicked: function(){
                    return false;
                },
                selectedVessels: function(){
                    return $scope.selectedVessels;
                }
            }
        });
        modalInstance.result.then(function () {
            //Get updated list of vessel groups
            $scope.getVesselGroupsForUser();
        }, function () {
            //Nothing on cancel
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

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });    

    init();
});
