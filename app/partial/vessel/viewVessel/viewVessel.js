angular.module('unionvmsWeb').controller('ViewVesselCtrl',function($scope, $modal, vesselRestService){

        //Watch for changes to the vesselObj
        $scope.$watch(function () { return $scope.vesselObj;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                console.log("new vessel view");
                getVesselHistory($scope.vesselObj.vesselId.value);
            }
        });   

        $scope.addNewMobileTerminalToVessel = function () {

            if ($scope.vesselObj.mobileTerminals === undefined) {
                $scope.vesselObj.mobileTerminals = [];
            }
            $scope.vesselObj.mobileTerminals.push({
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


        //Remove mobileTerminal system at index idx
        $scope.removeMobileSystem = function(item, idx){
            if (idx >= idx){
                $scope.vesselObj.mobileTerminals.splice(idx,1);
            }
        };

        //Toggle the vessel status
        $scope.changeVesselStatus = function(){
            $scope.vesselObj.active = !$scope.vesselObj.active;
        };

        //Show a message for 4 seconds
        var showMessage = function(){
            $('.updateResponseMessage').slideDown('slow');
            setTimeout(function() {
                $('.updateResponseMessage').slideUp('slow');
            }, 4000 );
        };

        //Update the Vessel
        $scope.updateVessel = function(){
            //MobileTerminals remove them cuz they do not exist in backend yet.
            delete $scope.vesselObj.mobileTerminals; 

            //Update Vessel and take care of the response(eg. the promise) when the update is done.
            var updateResponse = vesselRestService.updateVessel($scope.vesselObj)
                .then(updateVesselSuccess, updateVesselError);
        };

        //Vessel was successfully updated
        var updateVesselSuccess = function(updateResponse){
            console.log("The vessel has now been updated.");
            //Message to user
            $scope.updateResponseMessage = "The vessel has now been updated.";
            showMessage();
        };
        //Error updating vessel
        var updateVesselError = function(error){
            console.log("Opps, no update has been done.");
            //Message to user
            $scope.updateResponseMessage = "We are sorry but something went wrong and we could not update the vessel.";
            showMessage();
        };

        $scope.enableViewAllEvent = true;

        $scope.onViewAllEvent = function() {
            $scope.enableViewAllEvent = false;
            var response = vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value)
                .then(onVesselHistoryListSuccess, onVesselHistoryError);
        };

        var getVesselHistory = function(vesselId) {
            var response = vesselRestService.getVesselHistoryListByVesselId(vesselId, 5)
                .then(onVesselHistoryListSuccess, onVesselHistoryError);
        };

        $scope.onVesselHistoryClick = function(vesselHistoryId) {
            var response = vesselRestService.getVesselHistory(vesselHistoryId)
                .then(onVesselHistorySuccess, onVesselHistoryError);
        };

        var onVesselHistoryListSuccess = function(response) {
            if(!response || !response.data || !response.data.data) {
                console.log("onVesselHistorySuccess has no data");
            } else {
                $scope.vesselHistory = response.data.data;
            }
        };

        var onVesselHistorySuccess = function(response) {
            $scope.currentVesselHistory = response.data.data;
            openVesselHistoryModal();
        };

        var onVesselHistoryError = function(error) {
            console.log("onVesselHistoryError: " + error);
        };

        var openVesselHistoryModal = function(){
            var modalInstance = $modal.open({
              templateUrl: 'partial/vessel/vesselHistory/vesselHistoryModal/vesselHistoryModal.html',
              controller: 'VesselhistorymodalCtrl',
              //windowClass : "saveVesselGroupModal",
              size: "small",
              resolve: {
                vesselHistory: function() {
                    return $scope.currentVesselHistory;
                }
              }
            });

            modalInstance.result.then(function () {
            }, function () {
              //Nothing on cancel
            });
        };

});