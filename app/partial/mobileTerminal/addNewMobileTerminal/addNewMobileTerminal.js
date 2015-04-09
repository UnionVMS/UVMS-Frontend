angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, GetListRequest, vesselRestService, mobileTerminalRestService){
    $scope.errorMessage = "";

    var init = function(){
        //Get list transponder systems
        mobileTerminalRestService.getTranspondersConfig()
        .then(
            function(data){
                $.each(data, function(index, value){
                    //Set a view name
                    if(value.terminalSystemType === "INMARSAT_C"){
                        data[index].name = "Inmarsat-C Eik";
                    }

                });
                $scope.transponderSystems = data;
            },
            function(error){
                console.error(error);
                $scope.errorMessage = "You cannot create a mobile terminal at the moment. Error information: Failed to load terminal systems from the server. ";
            }
        );
    }; 

    $scope.isVisible = {
        assignVessel : false,
    };

    //Values for dropdowns
    $scope.transponderSystems =[];
    $scope.oceanRegions =[{'name':'AORE','code':'aore'}];

    //The values for the new mobile terminal
    $scope.selectedValues = {
        transponderSystem : '',
        oceanRegion : '',
        communicationChannels : []
    };

    //TODO: REMOVE THIS. It's just used for testing.
    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        $scope.selectedValues.communicationChannels.push({
            "dnid" : makeid()
        });
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.selectedValues.communicationChannels.splice(channelIndex, 1);
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.selectedValues.communicationChannels.splice(newIndex, 0, $scope.selectedValues.communicationChannels.splice(oldIndex, 1)[0]);
    };

    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };



    //Search objects and results
    $scope.assignVesselFreeText = "";
    $scope.assignVesselSearchTypes = ['NAME', 'IRCS', 'CFR'];
    $scope.assignVesselSearchInProgress = false;
    $scope.assignVesselSearchResults = {
        page : 1,
        totalNumberOfPages : 1,
        vessels : []
    };

    $scope.assignVesselSearch = function(){
        console.log("SEARCH!!!");
        $scope.assignVesselSearchInProgress = true;
        var getListRequest = new GetListRequest(1, 10, true, []);
        var searchValue = $scope.assignVesselFreeText +"*";
        getListRequest.addSearchCriteria("NAME", searchValue);
        getListRequest.addSearchCriteria("CFR", searchValue);
        getListRequest.addSearchCriteria("IRCS", searchValue);        
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    var onSearchVesselSuccess = function(vesselListPage){
        $scope.assignVesselSearchInProgress = false;
        console.log("onSearchVesselSuccess");
        console.log(vesselListPage);
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
         console.log($scope.assignVesselSearchResults);
    };

    var onSearchVesselError = function(response){
        $scope.assignVesselSearchInProgress = false;
        $scope.searchError = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");

        $scope.assignVesselSearchResults.totalNumberOfPages = 1;
        $scope.assignVesselSearchResults.page = 1;
    };

    $scope.onAssignVesselClick = function(vessel){
        console.log("assign to:");
        console.log(vessel);
        $scope.selectedVessel = vessel;
        $scope.newVesselObj = vessel;
    };

    $scope.onBackToAssignVesselSearchResultsClick = function(){
        $scope.selectedVessel = undefined;
    };

    init();


});

