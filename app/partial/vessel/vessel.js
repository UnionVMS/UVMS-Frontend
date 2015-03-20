angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $http, vessel, $route ){

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
    };



    $scope.vesselCountry = "Country";
    $scope.vesselActivity = "Activity";
    $scope.vesselIrc = "NO";
    $scope.vesselOverall = "Overall";
    $scope.vesselLicense = "License";
    $scope.vesselCity = "City";
    $scope.vesselEffect = "Effect";


    $scope.vesselCountries =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
    $scope.vesselactivitytypes =[{'name':'Fishing','code':'1124'},{'name':'Dock','code':'001'},{'name':'Trawling','code':'002'}];
    $scope.vesselircstypes =[{'name':'YES','code':'true'},{'name':'NO','code':'false'}];
    $scope.vesselLicensTypes =[{'name':'YES','code':'true'},{'name':'NO','code':'false'}];
    $scope.vesseloveralltypes =[{'name':'Overall 1','code':'1'},{'name':'Overall 2','code':'0'},{'name':'Overall 3','code':'20'}];
    $scope.vesselCities =[{'name':'London','code':'133'},{'name':'Gothenburg','code':'99'},{'name':'Amsterdam','code':'23'}];
    $scope.vesselEffectTypes =[{'name':'hp','code':'133'},{'name':'kW','code':'99'}];

    $scope.terminalsatellitetypes =[{'name':'Inmarsat-B','code':'133'},{'name':'Inmarsat-C','code':'998'}];
    $scope.terminaloceanstypes =[{'name':'Skagerack','code':'3'},{'name':'Kattegatt','code':'99'},{'name':'Östersjön','code':'929'}];



    $scope.overallSelected = function(item){
        if(item === undefined){
            $scope.vesselOverall = "Overall";
        }
        else
        {
            $scope.vesselOverall = item.name;
        }
    };

    $scope.ircSelected = function(item){
        if(item === undefined){
            $scope.vesselIrc = "NO";
        }
        else
        {
            $scope.vesselIrc = item.name;
        }

    };

    $scope.activitySelected = function(item){
        if(item === undefined){
            $scope.vesselActivity = "Activity";
        }
        else
        {
            $scope.vesselActivity = item.name;
        }
    };

    $scope.countrySelected = function(item){
        if(item === undefined){
            $scope.vesselCountry = "Country";
        }
        else
        {
            $scope.vesselCountry = item.name;
        }

    };

    $scope.licenseSelected = function(item){
        if(item === undefined){
            $scope.vesselLicense = "License";
        }
        else
        {
            $scope.vesselLicense = item.name;
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


});
