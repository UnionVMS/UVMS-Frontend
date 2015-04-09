angular.module('unionvmsWeb').controller('AssignvesselCtrl',function($scope, GetListRequest, vesselRestService, mobileTerminalRestService){


    //Search objects and results
    $scope.assignVesselFreeText = "";
    $scope.assignVesselSearchTypes = ['NAME', 'CFR', 'IRCS'];
    $scope.assignVesselSearchInProgress = false;
    $scope.assignVesselSearchResults = {
        page : 1,
        totalNumberOfPages : 1,
        vessels : []
    };
    $scope.assignVesselSearchResultsSortType = 'name';
    $scope.assignVesselSearchResultsSortReverse = false;    
    var getListRequest = new GetListRequest(1, 5, false, []);

    //Perform the serach
    $scope.assignVesselSearch = function(){
        //Create new request
        getListRequest = new GetListRequest(1, 5, false, []);
        $scope.assignVesselSearchInProgress = true;

        //Set search criterias
        var searchValue = $scope.assignVesselFreeText +"*";
        getListRequest.addSearchCriteria("NAME", searchValue);
        getListRequest.addSearchCriteria("CFR", searchValue);
        getListRequest.addSearchCriteria("IRCS", searchValue);        

        //Do the search
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Search success
    var onSearchVesselSuccess = function(vesselListPage){
        $scope.assignVesselSearchInProgress = false;
        $scope.assignVesselSearchResults.vessels.length = 0;
        if(vesselListPage.vessels.length === 0 ){
            $scope.searchError = "No vessels matching you search criteria was found.";
        } else {
            $scope.searchError = "";
            if(!$scope.assignVesselSearchResults.vessels){
                $scope.assignVesselSearchResults.vessels = vesselListPage.vessels;
                $scope.assignVesselSearchResults.totalNumberOfPages = vesselListPage.totalNumberOfPages;
            } else {
               for (var i = 0; i < vesselListPage.vessels.length; i++)
               {
                   $scope.assignVesselSearchResults.vessels.push(vesselListPage.vessels[i]);
               }
            }
            //Update page info
            $scope.assignVesselSearchResults.totalNumberOfPages = vesselListPage.totalNumberOfPages;
            $scope.assignVesselSearchResults.page = vesselListPage.currentPage;
         }
    };

    //Search error
    var onSearchVesselError = function(response){
        $scope.assignVesselSearchInProgress = false;
        $scope.searchError = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";

        $scope.assignVesselSearchResults.totalNumberOfPages = 1;
        $scope.assignVesselSearchResults.page = 1;
    };

    //Get next page
    $scope.onNextPageInAssignVesselSearchResults = function(){
        getListRequest.page += 1;
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Get prev page
    $scope.onPrevPageInAssignVesselSearchResults = function(){
        getListRequest.page -= 1;
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Handle click event on assign button
    $scope.onAssignVesselClick = function(vessel){
        $scope.selectedVessel = vessel;
        $scope.newVesselObj = vessel;
    };

    //Go back to search results
    $scope.onBackToAssignVesselSearchResultsClick = function(){
        $scope.selectedVessel = undefined;
    };


});