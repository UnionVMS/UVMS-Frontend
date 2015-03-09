angular.module('unionvmsWeb')
    .controller('newVesselCtrl', function ($scope, $http, vessel, $route, uvmsValidation) {

        $scope.removeNewMobileSystem = function (item, idx) {
            if (idx >= 0){
                $scope.newVesselObj.mobileTerminals.splice(idx, 1);
            }
        };



        $scope.addNewMobileTerminalToNewVessel = function () {
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
            "internalId": null,
            "ircs": null,
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
                var createVesselResp = vessel.createNewVessel($scope.newVesselObj)
                    .then(createVesselSuccess, createVesselError);
            }
        };

        var createVesselSuccess = function(createResponse){
            $scope.createResponseMessage = "The Vessel has been created successfully. You can close this window or just wait and it will close itself.";
            console.log = "The Vessel has now been created successfully";
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



    })
    .directive('newvessel', function () {
        return {
            restrict: 'E',
            replace: true,

            templateUrl: 'directive/newVessel/newVessel.html',
            link: function (scope, element, attrs, fn) {

            }
        };
    });
