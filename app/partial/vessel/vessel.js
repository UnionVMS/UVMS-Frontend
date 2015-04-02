angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $modal, GetListRequest, searchService, vesselRestService, validationService){

    //Init function when entering page
    $scope.initVessel = function(){
        //Load list with vessels
        var response = searchService.searchVessels()
            .then(onVesselSuccess, onError);

        $scope.getVesselGroupsForUser();
    };

    $scope.getVesselGroupsForUser = function(){
        //Load list of VesselGroups
        vesselRestService.getVesselGroupsForUser()
        .then(onVesselGroupListSuccess, onVesselGroupListError);
    };


    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 1,
        vessels : []
    };

    $scope.loadmore = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
        var response = searchService.searchVessels()
            .then(onVesselSuccess, onError);

        }
    };

    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        $scope.currentSearchResults.vessels.length = 0;

        //Success?
        if(vesselListPage.vessels !== undefined){
            onVesselSuccess(vesselListPage);    
        }else{
            onError();
        }
        
    };

    $scope.savegroupcallback = function(vesselListPage){
        $scope.getVesselGroupsForUser();
    };
    

    var onVesselSuccess = function(vesselListPage){
        $scope.vesselListPage = vesselListPage;
        if(vesselListPage.vessels.length === 0 ){
            $scope.error = "No vessels matching you search criteria was found.";
        } else {
            $scope.error = "";
            if(!$scope.currentSearchResults.vessels){
                $scope.currentSearchResults.vessels = vesselListPage.vessels;
                $scope.currentSearchResults.totalNumberOfPages = vesselListPage.totalNumberOfPages;
            } else {
               for (var i = 0; i < vesselListPage.vessels.length; i++)
               {
                   $scope.currentSearchResults.vessels.push(vesselListPage.vessels[i]);
               }
            }
            //Update page info
            $scope.currentSearchResults.totalNumberOfPages = vesselListPage.totalNumberOfPages;
            $scope.currentSearchResults.page = vesselListPage.currentPage;
         }
    };

    var onError = function(response){
        $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");

        $scope.currentSearchResults.totalNumberOfPages = 1;
        $scope.currentSearchResults.page = 1;
    };

    $scope.vesselGroups = [];
    var onVesselGroupListSuccess = function(groups){
        $scope.vesselGroups = groups;
    };

    var onVesselGroupListError = function(response){
       $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
       console.error("We are sorry... To err is human but to arr is pirate!!");
    };

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
                //$scope.searchObj.selectedVessels.push(item.vesselId);
               // $scope.searchObj.selectedVessels.push({"key": item.vesselId.type, "value": item.vesselId.value});
                $scope.selectedVessels.push(item.vesselId.value);
            });
        }
    };

    $scope.checkedVessel = function(item){
        $scope.selectedVessels = [];

        item.Selected = !item.Selected;

        angular.forEach($scope.currentSearchResults.vessels, function(item) {
            if(item.Selected){
                $scope.selectedVessels.push(item.vesselId.value);
            }
        });
    };

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


    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';
    $scope.advancesearch = { active: false };
    $scope.simpleSearch = {enable:false};
    $scope.vesselSearchContainerVisible = { active: true };
    $scope.toggleanim = function () {
        $scope.advancesearch.active = !$scope.advancesearch.active;
        $scope.wildCardSearch = "";
        $scope.simpleSearch.enable = !$scope.simpleSearch.enable;
    };


    $scope.addNewVesselVisible = {active:false};

    $scope.toggleAddNewVessel = function(){
        $scope.addNewVesselVisible.active = !$scope.addNewVesselVisible.active;
        $scope.vesselSearchContainerVisible.active = !$scope.vesselSearchContainerVisible.active;
    };

    $scope.getVesselVisible = {active:false};


    $scope.toggleGetVessel = function(item){
        if(item === undefined){
            $scope.newVesselObj = undefined;
        }
        else
        {
            //creating dummy for mobileterminals... Should be removed when there is support in backend for mobile terminals.
            var mobileTerminals = [];
            item.mobileTerminals = mobileTerminals;
            $scope.newVesselObj = item;
        }
        $scope.getVesselVisible.active = !$scope.getVesselVisible.active;
        $scope.vesselSearchContainerVisible.active = !$scope.vesselSearchContainerVisible.active;
        //set selected values in dropdowns accordingly to the selected vesselobject.
        $scope.setValuesInDropDowns();
        $scope.getVesselHistory($scope.newVesselObj.vesselId.value);
    };

    $scope.setValuesInDropDowns = function(){

        //set values in dropdowns if values in selected vessel corresponds to our dropdowns
        if( !! $scope.newVesselObj.countryCode ){
            $scope.vesselCountry = $scope.newVesselObj.countryCode;
        }

        if(!! $scope.newVesselObj.vesselType )
        {
            $scope.vesselActivity = $scope.newVesselObj.vesselType;
        }

        if(!! $scope.newVesselObj.hasIrcs )
        {
            if($scope.newVesselObj.hasIrcs ="true")
            { $scope.vesselHasIrc = "Yes";}
            else
            { $scope.vesselHasIrc = "No";}
        }

        if(!! $scope.newVesselObj.licenseSelected )
        {
            if($scope.newVesselObj.licenseSelected ="true")
            { $scope.vesselHasLicense = "Yes";}
            else
            { $scope.vesselHasLicense = "No";}
        }

        if(!! $scope.newVesselObj.licenseTypeSelected )
        {
            $scope.vesselLicenseType = $scope.newVesselObj.licenseTypeSelected;
        }


    };

    $scope.changeVesselStatus = function(){
        $scope.newVesselObj.active = $scope.newVesselObj.active === true ? false : true;
    };


    $scope.countrySelected = function(item){
        if(item === undefined){
            $scope.vesselCountry = "Country";
        } else {
            $scope.vesselCountry = item.name;
            $scope.newVesselObj.countryCode = item.name;
        }
    };

    $scope.activitySelected = function(item){
        if(item === undefined){
            $scope.vesselActivity = "Activity";
        } else {
            $scope.vesselActivity = item.name;
            $scope.newVesselObj.vesselType = item.name;
        }
    };

    $scope.ircSelected = function(item){
        if(item === undefined){
            $scope.vesselHasIrc = "No";
        } else {
            $scope.vesselHasIrc = item.name;
            $scope.newVesselObj.hasIrcs = item.code;
        }
    };

    $scope.licenseSelected = function(item){
        if(item === undefined){
            $scope.vesselHasLicense = "No";
        } else {
            $scope.vesselHasLicense = item.name;
            $scope.newVesselObj.hasLicense = item.code;
        }
    };

    $scope.licenseTypeSelected = function(item){
        if(item === undefined){
            $scope.vesselLicenseType = "Choose license type";
        } else {
            $scope.vesselLicenseType = item.name;
           // $scope.newVesselObj.licenseTypeSelected = item.name;
        }
    };

    $scope.overallSelected = function(item){
        if(item === undefined){
            $scope.vesselOverall = "LOA";
        } else {
            $scope.vesselOverall = item.name;
        }
    };

    $scope.unitOfMessureSelected = function(item){
        if(item === undefined){
            $scope.vesselUnitOfMessure= "London";
        } else {
            $scope.vesselUnitOfMessure = item.name;
        }
    };

    $scope.effectSelected = function(item){
        if(item === undefined){
            $scope.vesselEffect= "Effect";
        } else {
            $scope.vesselEffect = item.name;
        }
    };


});
