angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $http, vesselRestService, $route, vesselAdvancedSearchService, validationService, vesselSavedSearchesService, $window,$modal ){

    //Load list with vessels when entering page
    $scope.getInitialVessels = function(){
        var response = vesselRestService.getVesselList($scope.listSize, $scope.page, $scope.criteria, $scope.isDynamic)
            .then(onVesselSuccess, onError);

        $scope.getVesselGroupsForUser();
    };

    $scope.getVesselGroupsForUser = function(){
        //Load list of VesselGroups
        vesselSavedSearchesService.getVesselGroupsForUser()
        .then(onVesselGroupListSuccess, onVesselGroupListError);
    };

    //initial page or the page to get.
    $scope.page = "1";
    // listsize = the number of pages to get by page
    $scope.listSize = "10";
    //Total Number Of Pages
    $scope.totalNumberOfPages = "";
    //search criteria
    $scope.criteria = [];
    //search is dynamic
    $scope.isDynamic = "true";

    $scope.loadmore = function(){
        if($scope.page < $scope.totalNumberOfPages )
        {
            $scope.page++;
            vesselRestService.getVesselList($scope.listSize, $scope.page, $scope.criteria, $scope.isDynamic)
                .then(onVesselSuccess, onError);
        }
    };

    var onVesselSuccess = function(response){
        if( (!response.data.data.vessel) || response.data.data.vessel.length === 0 ){
            $scope.error = "No vessels could be retrieved at this time.";
            console.log("No vessels in database?");
        } else {
            $scope.error = "";
            if(!$scope.vessels){
                $scope.vessels = response.data.data.vessel;
                $scope.totalNumberOfPages = response.data.data.totalNumberOfPages;
            } else {
               for (var i = 0; i < response.data.data.vessel.length; i++)
               {
                   $scope.vessels.push(response.data.data.vessel[i]);
               }
            }
            if ($scope.totalNumberOfPages === ""){
                $scope.totalNumberOfPages = response.data.data.totalNumberOfPages;
            }
         }
    };

    var onError = function(response){
       $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");
    };

    $scope.vesselGroups = [];
    var onVesselGroupListSuccess = function(response){
        if( (!response.data.data) || response.data.data.length === 0 )
        {
            $scope.error = "No vessel groups could be retrieved at this time.";
            console.log("No vessels groups in database?");
        }
        else{
            $scope.vesselGroups = response.data.data;
        }
    };

    var onVesselGroupListError = function(response){
       $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");
    };

    $scope.checkAll = function(){
        if($scope.selectedAll)
        {
            $scope.selectedAll = false;
            delete $scope.selectedVessels;
            angular.forEach($scope.vessels, function(item) {
                item.Selected = $scope.selectedAll;
            });
        } else {
            $scope.selectedAll = true;
            $scope.selectedVessels = [];
            angular.forEach($scope.vessels, function(item) {
                item.Selected = $scope.selectedAll;
                //$scope.searchObj.selectedVessels.push(item.vesselId);
               // $scope.searchObj.selectedVessels.push({"key": item.vesselId.type, "value": item.vesselId.value});
                $scope.selectedVessels.push(item.vesselId.value);
            });
        }
    };

    $scope.checkedVessel = function(item){
        $scope.selectedVessels = [];

        item.Selected = item.Selected === true ? false : true;

        angular.forEach($scope.vessels, function(item) {
            if(item.Selected){
               // $scope.searchObj.selectedVessels.push({"key": item.vesselId.type, "value": item.vesselId.value});
                $scope.selectedVessels.push(item.vesselId.value);
            }
        });
    };

    $scope.openSelectedSaveGroupModal = function() {
        var modalInstance = $modal.open({
            templateUrl: '../../directive/vessel/advancedSearch/saveVesselGroupModal/saveVesselGroupModal.html',
            controller: 'SaveVesselGroupModalInstanceCtrl',
            windowClass: "saveVesselGroupModal",
            size: "small",
            resolve: {
                searchObj: function () {
                    return $scope.selectedVessels;
                },
                vesselGroups: function () {
                    return $scope.vesselGroups;
                },
                advancedSearchClicked: function () {
                    return false;
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

    // DROPDOWNS DUMMIES - Needs to have some sort of connection to database... and needs to be refatoried when settingsfile is correct or present.
    $scope.vesselCountry = "Country";
    $scope.vesselActivity = "Activity";
    $scope.vesselHasIrc = "No";
    $scope.vesselOverall = "LOA";
    $scope.vesselHasLicense = "No";
    $scope.vesselLicenseType = "Choose license type";
    $scope.vesselUnitOfMessure = "London";
    $scope.vesselEffect = "Effect";
    $scope.searchFlagState = "Flag state";
    $scope.searchLicenseType = "License type";
    $scope.searchActive = "Active";
    $scope.searchVesselType = "Type";


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

    //########### PERFORM SEARCH ###########
    $scope.wildCardSearch = "";

    $scope.searchVessels = function(dynamic){
        //If something in searchtextbox perform a wildcardseach
        if($scope.wildCardSearch !== "") {
            //call for search method with wildcard and re-populate the vessellist
            if (validationService.lettersAndDigits($scope.wildCardSearch)) {
                $scope.criteria = [
                    {
                        "value": $scope.wildCardSearch + "*",
                        "key": "NAME"
                    },
                    {
                        "value": $scope.wildCardSearch + "*",
                        "key": "IRCS"
                    },
                    {
                        "value": $scope.wildCardSearch + "*",
                        "key": "CFR"
                    }
                ];
                $scope.isDynamic = "false";
                delete $scope.vessels;
                vesselRestService.getVesselList($scope.listSize, $scope.page, $scope.criteria, $scope.isDynamic)
                    .then(onVesselSuccess, onError);
            }
        } else {
            delete $scope.vessels;
            $scope.criteria = [];
            if(dynamic) {
                $scope.searchObj = vesselAdvancedSearchService.getAdvSearchObj();
                for (var i in $scope.searchObj) {
                    if ($scope.searchObj[i] !== "") {
                        $scope.criteria.push({"key": i, "value": $scope.searchObj[i]});
                    }
                }
                $scope.isDynamic = "true";

            } else {
                $scope.criteria = $scope.searchObj;
                $scope.isDynamic = "false";
            }
            vesselRestService.getVesselList($scope.listSize, $scope.page, $scope.criteria, $scope.isDynamic)
                .then(onVesselSuccess, onError);
        }
    };

    //########### ADVANCEDSEARCH ###########
    var resetSearch = function(){
        $scope.wildCardSearch = "";
        vesselAdvancedSearchService.cleanAdvancedSearchJsonObj();
        $scope.searchActiveSelected();
        $scope.searchAddCFR();
        $scope.searchAddExternalMarking();
        $scope.searchFlagStateSelected();
        $scope.searchAddHomePort();
        $scope.searchAddIRCS();
        $scope.searchLicenseTypeSelected();
        $scope.searchAddMMSI();
        $scope.searchAddName();
        $scope.searchVesselTypeSelected();
    };

    //A saved search is selected
    $scope.savedSearchSelected = function(item){
        //Reset search
        resetSearch();

        //Dyanmic search?
        if(item.dynamic){
            //Show advanced search if hidden
            if(!$scope.advancesearch.active){
                $scope.toggleanim();
            }

            //Add all search fields to the search object
            $.each(item.searchFields, function(index, searchField){
                var selectItem = {"name" : searchField.value, "code" : searchField.value};
                switch (searchField.key){
                    case "ACTIVE":
                        $scope.searchActiveSelected(selectItem);
                        break;
                    case "CFR":
                        $scope.searchAddCFR(selectItem.name);
                        break;
                    case "EXTERNAL_MARKING":
                        $scope.searchAddExternalMarking(selectItem.name);
                        break;
                    case "FLAG_STATE":
                        $scope.searchFlagStateSelected(selectItem);
                        break;
                    case "HOMEPORT":
                        $scope.searchAddHomePort(selectItem);
                        break;
                    case "IRCS":
                        $scope.searchAddIRCS(selectItem.name);
                        break;
                    case "LICENSE":
                        $scope.searchLicenseTypeSelected(selectItem);
                        break;
                    case "MMSI":
                        $scope.searchAddMMSI(selectItem);
                        break;
                    case "NAME":
                        $scope.searchAddName(selectItem.name);
                        break;
                    case "TYPE":
                        $scope.searchVesselTypeSelected(selectItem);
                        break;
                    default:
                        break;
                }
            });
        } else {
            console.log("TODO: STATIC SEARCH");

            $scope.searchObj = item.searchFields;
        }
        //Perform the search
       // console.log($scope.searchObj);
       // console.log(vesselAdvancedSearchService.getAdvSearchObj());
        $scope.searchVessels(item.dynamic);
    };

    $scope.searchObj  = [];

    //Watch for changes to the searchObj
    $scope.$watch(function () { return vesselAdvancedSearchService.getAdvSearchObj();}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.searchObj  = vesselAdvancedSearchService.getAdvSearchObj();
        }
    });

    $scope.searchFlagStateSelected = function (item) {
        if (item === undefined) {
            $scope.searchFlagState = "Flag state";
            vesselAdvancedSearchService.addFlagState("");
        } else {
            $scope.searchFlagState = item.name;
            vesselAdvancedSearchService.addFlagState(item.code);
        }
    };

    $scope.searchVesselTypeSelected = function(item){
        if(item === undefined){
            $scope.searchVesselType = "Type";
            vesselAdvancedSearchService.addType("");
        } else {
            $scope.searchVesselType = item.name;
            vesselAdvancedSearchService.addType(item.code);
        }
    };

    $scope.searchActiveSelected = function(item){
        if(item === undefined){
            $scope.searchActive = "Active";
            vesselAdvancedSearchService.addActive("");
        } else {
            $scope.searchActive = item.name;
            vesselAdvancedSearchService.addActive(item.code);
        }
    };

    $scope.searchLicenseTypeSelected = function(item){
        if(item === undefined){
            $scope.searchLicenseType = "License";
            vesselAdvancedSearchService.addLicenseType("");
        } else {
            $scope.searchLicenseType = item.name;
            vesselAdvancedSearchService.addLicenseType(item.code);
        }
    };

    $scope.searchAddCFR = function(data){
        vesselAdvancedSearchService.addCFR(data);
    };

    $scope.searchAddIRCS = function(data){
        vesselAdvancedSearchService.addIRCS(data);
    };

    $scope.searchAddName = function(data){
        vesselAdvancedSearchService.addName(data);
    };

    $scope.searchAddExternalMarking = function(data){
        vesselAdvancedSearchService.addExternalMarking(data);
    };

    $scope.searchAddHomePort = function(data){
        vesselAdvancedSearchService.addHomePort(data);
    };

    $scope.searchAddMMSI = function(data){
        vesselAdvancedSearchService.addMMSI(data);
    };

    $scope.datePicker = (function () {
        var method = {};
        method.instances = [];

        method.open = function ($event, instance) {
            $event.preventDefault();
            $event.stopPropagation();
            method.instances[instance] = true;
        };

        method.options = {
            'show-weeks': false,
            startingDay: 0
        };

        var formats = ['MM/dd/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        method.format = formats[4];
        return method;
    }());


    //Dummyata for dropdowns....
    $scope.vesseloveralltypes =[{'name':'LOA','code':'1'},{'name':'LBP','code':'0'}];
    $scope.vesselUnitOfMessures =[{'name':'London','code':'London'}];
    $scope.vesselEffectTypes =[{'name':'hp','code':'133'},{'name':'kW','code':'99'}];
    $scope.terminalsatellitetypes =[{'name':'Inmarsat-B','code':'133'},{'name':'Inmarsat-C','code':'998'}];
    $scope.terminaloceanstypes =[{'name':'Skagerack','code':'3'},{'name':'Kattegatt','code':'99'},{'name':'Östersjön','code':'929'}];
    $scope.vesselCountries =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
    $scope.vesselActivitytTypes =[{'name':'Fishing Vessel','code':'Fishing Vessel'},{'name':'Pilot Vessel','code':'Pilot Vessel'},{'name':'Trawling Vessel','code':'Trawling Vessel'}];
    $scope.vesselHasIrcTypes =[{'name':'Yes','code':'true'},{'name':'No','code':'false'}];
    $scope.vesselLicensTypes =[{'name':'Fishing license','code':'Fishing license'},{'name':'Trawling license','code':'Trawling license'}];
    $scope.searchFlagStates =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
    $scope.vesselVesselTypes =[{'name':'Fishing Vessel','code':'Fishing Vessel'},{'name':'Pilot Vessel','code':'Pilot Vessel'},{'name':'Trawling Vessel','code':'Trawling Vessel'}];
    $scope.searchLicensTypes =[{'name':'Fishing license','code':'Fishing license'},{'name':'Trawling license','code':'Trawling license'}];
    $scope.searchActiveTypes = [{'name':'Yes','code':'true'},{'name':'No','code':'false'}];
});
