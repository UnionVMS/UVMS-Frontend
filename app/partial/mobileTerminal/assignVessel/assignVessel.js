angular.module('unionvmsWeb').controller('AssignvesselCtrl',function($scope, $location, GetListRequest, vesselRestService, mobileTerminalRestService, alertService, locale, modalComment){

    //Watch for toggle (show) of AssignVessel partial and reset search and selectedVessel when that happens
    $scope.$watch(function () { 
        if(angular.isDefined($scope.isVisible)){
            return $scope.isVisible.assignVessel;
        }
    }, function (newVal, oldVal) {
        if (newVal) {
            resetSearch();
            $scope.selectedVessel = undefined;
        }
    });   

    //Reset the search for assign vessel
    var resetSearch = function() {
        $scope.assignVesselSearchResults = {
            page : 1,
            totalNumberOfPages : 1,
            vessels : [],
            sortBy : 'name',
            sortReverse : false,
            errorMessage : ""
        };

        $scope.assignVesselFreeText = "";
        $scope.assignVesselSearchType = "ALL";
        $scope.assignVesselSearchInProgress = false;
        getListRequest = new GetListRequest(1, 5, false, []);
    };    

    //Search objects and results
    $scope.assignVesselSearchTypes =[{'text':'Name/CFR/IRCS','code':'ALL'}, {'text':'Name','code':'NAME'}, {'text':'CFR','code':'CFR'}, {'text':'IRCS','code':'IRCS'}];
    var getListRequest;
    resetSearch();


    var init = function() {
        resetSearch();        
    };

    //Perform the serach
    $scope.assignVesselSearch = function(){
        //Create new request
        getListRequest = new GetListRequest(1, 5, false, []);
        $scope.assignVesselSearchInProgress = true;

        //Set search criterias
        var searchValue = $scope.assignVesselFreeText +"*";
        if($scope.assignVesselSearchType === "ALL"){
            getListRequest.addSearchCriteria("NAME", searchValue);
            getListRequest.addSearchCriteria("CFR", searchValue);
            getListRequest.addSearchCriteria("IRCS", searchValue);
        }else{
            getListRequest.addSearchCriteria($scope.assignVesselSearchType, searchValue);
        }

        //Do the search
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Search success
    var onSearchVesselSuccess = function(vesselListPage){
        $scope.assignVesselSearchInProgress = false;
        $scope.assignVesselSearchResults.vessels.length = 0;
        if(vesselListPage.vessels.length === 0 ){
            $scope.assignVesselSearchResults.errorMessage = "No vessels matching you search criteria was found.";
        } else {
            $scope.assignVesselSearchResults.errorMessage = "";
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
        $scope.assignVesselSearchResults.errorMessage = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";

        $scope.assignVesselSearchResults.totalNumberOfPages = 1;
        $scope.assignVesselSearchResults.page = 1;
    };

    //Get next page
    $scope.gotoNextPageInAssignVesselSearchResults = function(){
        getListRequest.page += 1;
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Get prev page
    $scope.gotoPrevPageInAssignVesselSearchResults = function(){
        getListRequest.page -= 1;
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Handle click event on select vessel button
    $scope.selectVessel = function(vessel){
        $scope.selectedVessel = vessel;
        $scope.newVesselObj = vessel;
    };

    $scope.assignToSelectedVesselWithComment = function(comment) {
        var validAssignment = $scope.currentMobileTerminal && $scope.selectedVessel.ircs;
        if (!validAssignment) {
            console.error("Vessel is missing internalId so assigning the mobile terminal to the vessel is not possible.");
            return;
        }

        mobileTerminalRestService.assignMobileTerminal($scope.currentMobileTerminal, $scope.selectedVessel.ircs, comment).then(function() {
            $scope.currentMobileTerminal.assignToVesselWithIrcs($scope.selectedVessel.ircs);
            $scope.currentMobileTerminal.associatedVessel = $scope.selectedVessel;
            $scope.toggleAssignVessel();
            $scope.goBackToAssignVesselSearchResultsClick();
            resetSearch();

            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.assign_vessel_message_on_success'));
        },
        function() {
            alertService.showErrorMessage(locale.getString('mobileTerminal.assign_vessel_message_on_error'));
        });
    };

    $scope.assignToSelectedVessel = function() {
        modalComment.open($scope.assignToSelectedVesselWithComment, {
            titleLabel: locale.getString("mobileTerminal.assigning_to_vessel", [$scope.currentMobileTerminal.getSerialNumber(), $scope.selectedVessel.name]),
            saveLabel: locale.getString('mobileTerminal.assign')
        });
    };

    //Go back to search results
    $scope.goBackToAssignVesselSearchResultsClick = function(){
        $scope.selectedVessel = undefined;
    };

    //Create new vessel
    $scope.gotoCreateNewVessel = function(){
        $location.path("/vessel");
    };

    init();

});