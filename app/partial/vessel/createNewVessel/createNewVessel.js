angular.module('unionvmsWeb').controller('CreateNewVesselCtrl',function($scope, $route, Vessel, vesselRestService, alertService, locale){

    //The new vessel
    $scope.newVesselObj = new Vessel();

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


    //Create a new vessel
    $scope.createNewVessel = function(){
        if($scope.newVesselForm.$valid) {
            //Create new Vessel
            vesselRestService.createNewVessel($scope.newVesselObj)
                .then(createVesselSuccess, createVesselError);
        }
    };

    //Success creating the new vessel
    var createVesselSuccess = function(createResponse){
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.add_new_alert_message_on_success'));
        setTimeout(function() {
            $route.reload();
        }, 2000 );
    };

    //Error creating the new vessel
    var createVesselError = function(error){
        alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_error'));
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.newVesselObj = new Vessel();
    };

});
