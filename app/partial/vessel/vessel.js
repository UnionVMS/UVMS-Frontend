angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $http, vessel, $route, uvmsTranslationService, uvmsAdvancedSearch, $window ){



    //Load list with vessels when entering page
    $scope.getInitialVessels = function(){
        var response = vessel.getVesselList()
            .then(onVesselSuccess, onError);
    };

    var onVesselSuccess = function(response){
        if( (!response.data.data) || response.data.data.length === 0 )
        {
            $scope.error = "No vessels could be retrieved at this time.";
            console.log("No vessels in database?");
        }
        else{
        $scope.vessels = response.data.data;
         }
    };
    var onError = function(response){

       $scope.error = "We are sorry... Something took a wrong turn. To err is human but to arr is pirate!!";
        console.log("We are sorry... To err is human but to arr is pirate!!");
    };

    $scope.checkAll = function(){
        if($scope.selectedAll)
        {
            $scope.selectedAll = false;
        }
        else
        {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.vessels, function(item) {
            item.Selected = $scope.selectedAll;
        });
    };

    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';



    $scope.advancesearch = { active: false };
    $scope.vesselSearchContainerVisible = { active: true };
    $scope.toggleanim = function () {
        $scope.advancesearch.active = !$scope.advancesearch.active;
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
            var mobileTerminals = [
            {
                "satelliteSystem":[
                    {
                        "name":'inmarsat-C',
                        "code":'001'
                    },
                    {
                        "name":'inmarsat-B',
                        "code":'002'
                    }
                ],
                "oceanRegions":[
                    {
                        "name":'AORE',
                        "code":'001'
                    },
                    {
                        "name":'EPOC',
                        "code":'002'
                    }
                ],
                'transeiverType':'sailor 6140',
                'serialNo':'4TT097411A33',
                'softvareVersion':'1.3-6',
                'antenna':'Sailor 6403',
                'satelliteNo':'423 654 852',
                'answerBack':'42655744 SKRM',
                'installedBy':'Svensson AB',
                'installedOn':'2014-01-05',
                'startedOn':'2014-05-01',
                'uninstalledOn':'',
                "communicationChannels": [
                    {
                        'number':'10689',
                        'order':'1',
                        'name':'VMS',
                        'id':'104',
                        'orderId':'2',
                        'note':'EIK, VIZADA',
                        'startDate':'2015-01-01',
                        'endDate':'2015-05-01'
                    }
                ]
            },
            {
                "satelliteSystem":[
                    {
                        "name":'inmarsat-A',
                        "code":'001'
                    }
                ],
                "oceanRegions":[
                    {
                        "name":'AORE',
                        "code":'001'
                    },
                    {
                        "name":'EPOC',
                        "code":'002'
                    }
                ],
                'transeiverType':'sailor 6140',
                'serialNo':'5TT097411A33',
                'softvareVersion':'1.3-6',
                'antenna':'Sailor 6403',
                'satelliteNo':'423 654 852',
                'anserBack':'42655744 SKRM',
                'installedBy':'Svensson AB',
                'installedOn':'2014-01-05',
                'startedOn':'2014-05-01',
                'uninstalledOn':'',
                "communicationChannels": [
                    {
                        'number':'1689',
                        'order':'1',
                        'name':'VMS',
                        'id':'104',
                        'orderId':'2',
                        'note':'EIK, VIZADA',
                        'startDate':'2015-01-01',
                        'endDate':'2015-05-01'
                    },
                    {
                        'number':'689',
                        'order':'1',
                        'name':'VMS',
                        'id':'104',
                        'orderId':'2',
                        'note':'EIK, VIZADA',
                        'startDate':'2015-01-01',
                        'endDate':'2015-05-01'
                    },
                    {
                        'number':'89',
                        'order':'1',
                        'name':'VMS',
                        'id':'104',
                        'orderId':'2',
                        'note':'EIK, VIZADA',
                        'startDate':'2015-01-01',
                        'endDate':'2015-05-01'
                    }
                ]
            }
        ];
            item.mobileTerminals = mobileTerminals;
            $scope.newVesselObj = item;
        }
        $scope.getVesselVisible.active = !$scope.getVesselVisible.active;
        $scope.vesselSearchContainerVisible.active = !$scope.vesselSearchContainerVisible.active;
        //set selected values in dropdowns accordingly to the selected vesselobject.
        $scope.setValuesInDropDowns();
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
    $scope.vesselOverall = "Overall";
    $scope.vesselHasLicense = "No";
    $scope.vesselLicenseType = "Choose license type";
    $scope.vesselCity = "City";
    $scope.vesselEffect = "Effect";
    $scope.searchFlagState = "Flag state";
    $scope.searchLicenseType = "License type";
    $scope.searchActive = "Active";
    $scope.searchVesselType = "Type";


    $scope.countrySelected = function(item){
        if(item === undefined){
            $scope.vesselCountry = "Country";
        }
        else
        {
            $scope.vesselCountry = item.name;
            $scope.newVesselObj.countryCode = item.name;
        }
    };

    $scope.activitySelected = function(item){
        if(item === undefined){
            $scope.vesselActivity = "Activity";
        }
        else
        {
            $scope.vesselActivity = item.name;
            $scope.newVesselObj.vesselType = item.name;
        }
    };

    $scope.ircSelected = function(item){
        if(item === undefined){
            $scope.vesselHasIrc = "No";
        }
        else
        {
            $scope.vesselHasIrc = item.name;
            $scope.newVesselObj.hasIrcs = item.code;
        }
    };

    $scope.licenseSelected = function(item){
        if(item === undefined){
            $scope.vesselHasLicense = "No";
        }
        else
        {
            $scope.vesselHasLicense = item.name;
            $scope.newVesselObj.hasLicense = item.code;
        }
    };


    $scope.licenseTypeSelected = function(item){
        if(item === undefined){
            $scope.vesselLicenseType = "Choose license type";
        }
        else
        {
            $scope.vesselLicenseType = item.name;
           // $scope.newVesselObj.licenseTypeSelected = item.name;
        }
    };

    $scope.overallSelected = function(item){
        if(item === undefined){
            $scope.vesselOverall = "Overall";
        }
        else
        {
            $scope.vesselOverall = item.name;
        }
    };

    $scope.citySelected = function(item){
        if(item === undefined){
            $scope.vesselCity= "City";
        }
        else
        {
            $scope.vesselCity = item.name;
        }
    };

    $scope.effectSelected = function(item){
        if(item === undefined){
            $scope.vesselEffect= "Effect";
        }
        else
        {
            $scope.vesselEffect = item.name;
        }
    };

    //########### PERFORM SEARCH ###########
    $scope.wildCardSearch = "";
    $scope.searchVessels = function(){
        //If something in searchtextbox perform a wildcardseach
        if($scope.wildCardSearch !== "")
        {
            //call for search method with wildcard and re-populate the vessellist
            uvmsAdvancedSearch.performWildcardSearch($scope.wildCardSearch);
            $window.alert($scope.wildCardSearch);
        }
        else
        {
            //call for search method with searchObj and re-populate the vessellist
            uvmsAdvancedSearch.performAdvancedSearch();
            $window.alert($scope.searchObj.FLAG_STATE + " " + $scope.searchObj.NAME + " etc...");
        }
    };


    //########### ADVANCEDSEARCH ###########
    $scope.searchObj  = uvmsAdvancedSearch.getAdvSearchObj();

    $scope.searchFlagStateSelected = function(item){
        if(item === undefined){
            $scope.searchFlagState = "Flag state";
            uvmsAdvancedSearch.addFlagState("");
        }
        else
        {
            $scope.searchFlagState = item.name;
            uvmsAdvancedSearch.addFlagState(item.code);
        }
    };

    $scope.searchVesselTypeSelected = function(item){
        if(item === undefined){
            $scope.searchType = "Type";
            uvmsAdvancedSearch.addType("");
        }
        else
        {
            $scope.searchType = item.name;
            uvmsAdvancedSearch.addType(item.name);
        }
    };

    $scope.searchActiveSelected = function(item){
        if(item === undefined){
            $scope.searchActive = "Active";
            uvmsAdvancedSearch.addActive("");
        }
        else
        {
            $scope.searchActive = item.name;
            uvmsAdvancedSearch.addActive(item.code);
        }
    };

    $scope.searchLicenseTypeSelected = function(item){
        if(item === undefined){
            $scope.searchType = "License";
            uvmsAdvancedSearch.addLicenseType("");
        }
        else
        {
            $scope.searchType = item.name;
            uvmsAdvancedSearch.addLicenseType(item.name);
        }
    };


    $scope.searchAddCFR = function(data){
        uvmsAdvancedSearch.addCFR(data);
    };
    $scope.searchAddIRCS = function(data){
        uvmsAdvancedSearch.addIRCS(data);
    };


    /**/
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
    $scope.vesseloveralltypes =[{'name':'Overall','code':'1'},{'name':'Between perpendiculars','code':'0'}];
    $scope.vesselCities =[{'name':'London','code':'133'},{'name':'Gothenburg','code':'99'},{'name':'Amsterdam','code':'23'}];
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
