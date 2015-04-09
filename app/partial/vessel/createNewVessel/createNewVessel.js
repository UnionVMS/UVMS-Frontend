angular.module('unionvmsWeb').controller('CreateNewVesselCtrl',function($scope, $route, vesselRestService){

    //The new vessel
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

    //Remove the mobile terminal at index idx
    $scope.removeNewMobileSystem = function (item, idx) {
        if (idx >= 0){
            $scope.newVesselObj.mobileTerminals.splice(idx, 1);
        }
    };


    //Add a new mobile terminal to the vessel
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


    //Show a message for 4 seconds
    var showMessage = function(){
        $('.createResponseMessage').slideDown('slow');
        setTimeout(function() {
            $('.createResponseMessage').slideUp('slow');
        }, 4000 );
    };        

    //Create a new vessel
    $scope.createNewVessel = function(){
        if($scope.newVesselForm.$valid) {
            //MobileTerminals remove them cuz they do not exist in backend yet.
            delete $scope.newVesselObj.mobileTerminals;

            //Create new Vessel
            vesselRestService.createNewVessel($scope.newVesselObj)
                .then(createVesselSuccess, createVesselError);
        }
    };

    //Success creating the new vessel
    var createVesselSuccess = function(createResponse){
        $scope.createResponseMessage = "The Vessel has been created successfully. You can close this window or just wait and it will close itself.";
        showMessage();
        console.log = "The Vessel has been created successfully";
        setTimeout(function() {
            $route.reload();
        }, 2000 );

    };

    //Error creating the new vessel
    var createVesselError = function(error){
        $scope.createResponseMessage = "We are sorry but something went wrong when we tried to create a new Vessel. Please try again in a moment or close the window.";
        showMessage();
        console.log = "The Vessel has NOT been created!";
        console.log = "ERROR: " + error.statusText;
        console.log = "ERROR: " + error.status ;
    };

    //Clear the form
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

});