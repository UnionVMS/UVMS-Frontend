angular.module('unionvmsWeb')
    .controller('newVesselCtrl', function ($scope, $http, vesselRestService, $route, validationService) {


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

        //Dummy values for dropdowns
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


        $scope.removeNewMobileSystem = function (item, idx) {
            if (idx >= 0){
                $scope.newVesselObj.mobileTerminals.splice(idx, 1);
            }
        };



        $scope.addNewMobileTerminalToNewVessel = function () {

            if  ($scope.newVesselObj === undefined){
                $scope.clearForm();
            }

            if ($scope.newVesselObj.mobileTerminals === undefined) {
                $scope.newVesselObj.mobileTerminals = [];
            }


            $scope.newVesselObj.mobileTerminals.push({
                "satelliteSystem": [
                    {
                        "name": 'inmarsat-C',
                        "code": '001'
                    },
                    {
                        "name": 'inmarsat-B',
                        "code": '002'
                    }
                ],
                "oceanRegions": [
                    {
                        "name": 'AORE',
                        "code": '001'
                    },
                    {
                        "name": 'EPOC',
                        "code": '002'
                    }
                ],
                'transeiverType': '',
                'serialNo': '',
                'softvareVersion': '',
                'antenna': '',
                'satelliteNo': '',
                'anserBack': '',
                'installedBy': '',
                'installedOn': '',
                'startedOn': '',
                'uninstalledOn': ''
            });
        };


       $scope.newVesselObj = {

            "active": true,
            "billing": "",
            "cfr": null,
            "countryCode": null,
            "externalMarking": null,
            "grossTonnage": null,
            "hasIrcs": false,
            "hasLicense": false,
            "homePort": null,
            "imo": "",
            "ircs": "",
            "lengthBetweenPerpendiculars": null,
            "lengthOverAll": null,
            "mmsiNo": "",
            "name": "",
            "otherGrossTonnage": null,
            "powerAux": null,
            "powerMain": null,
            "safetyGrossTonnage": null,
            "source": "LOCAL",
            "vesselType": null

        };


        $scope.createNewVessel = function(){
            if($scope.newVesselForm.$valid) {

                //delete $scope.newVesselObj;
                delete $scope.newVesselObj.mobileTerminals; //MobileTerminals remove them cuz they do not exist in backend yet.

                //Feedback to user.
                $('.createResponseMessage').fadeIn();
                //Hide feedback to user
                setTimeout(function () {
                    $('.createResponseMessage').fadeOut();
                }, 4000);
                //Create new Vessel and take care of the response(eg. the promise) when the create is done.
                var createVesselResp = vesselRestService.createNewVessel($scope.newVesselObj)
                    .then(createVesselSuccess, createVesselError);
            }
        };



        var createVesselSuccess = function(createResponse){
            $scope.createResponseMessage = "The Vessel has been created successfully. You can close this window or just wait and it will close itself.";
            console.log = "The Vessel has been created successfully";
            setTimeout(function() {
                $route.reload();
            }, 2000 );

        };

        var createVesselError = function(error){
            $scope.createResponseMessage = "We are sorry but something went wrong when we tried to create a new Vessel. Please try again in a moment or close the window.";
            console.log = "The Vessel has NOT been created!";
            console.log = "ERROR: " + error.statusText;
            console.log = "ERROR: " + error.status ;
        };

        $scope.clearForm = function(){
            //delete or empty
            $scope.newVesselObj = {


                "active": true,
                "billing": "",
                "cfr": null,
                "countryCode": null,
                "externalMarking": null,
                "grossTonnage": null,
                "hasIrcs": false,
                "hasLicense": false,
                "homePort": null,
                "imo": "",
                "ircs": "",
                "lengthBetweenPerpendiculars": null,
                "lengthOverAll": null,
                "mmsiNo": "",
                "name": "",
                "otherGrossTonnage": null,
                "powerAux": null,
                "powerMain": null,
                "safetyGrossTonnage": null,
                "source": "LOCAL",
                "vesselType": null

            };
        };


    })
    .directive('newvessel', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'directive/vessel/newVessel/newVessel.html',
            link: function (scope, element, attrs, fn) {

            }
        };
    });
