angular.module('unionvmsWeb')
    .controller('getVesselCtrl', function($scope, $modal, vessel){

        $scope.addNewMobileTerminalToVessel = function () {



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



        $scope.removeMobileSystem = function(item, idx){
            if (idx >= idx){
                $scope.newVesselObj.mobileTerminals.splice(idx,1);
            }
            };

       /* $scope.changeVesselStatus = function(){
            $scope.newVesselObj.active = $scope.newVesselObj.active === true ? false : true;
        };*/

        $scope.updateVessel = function(){
            delete $scope.newVesselObj.mobileTerminals; //MobileTerminals remove them cuz they do not exist in backend yet.

            //Feedback to user.
            $('.updateResponseMessage').fadeIn();
            //Update Vessel
            //vessel.updateVessel($scope.newVesselObj);
            //Hide feedback to user
            setTimeout(function() {
                $('.updateResponseMessage').fadeOut();
            }, 4000 );
            //Update Vessel and take care of the response(eg. the promise) when the update is done.
            var updateResponse = vessel.updateVessel($scope.newVesselObj)
                .then(updateVesselSuccess, updateVesselError);
        };

        var updateVesselSuccess = function(updateResponse){
            //Message to user
            $scope.updateResponseMessage = "The vessel has now been updated.";
        };
        var updateVesselError = function(error){
            //Message to user
            $scope.updateResponseMessage = "We are sorry but something went wrong and we could not update the vessel.";
            //Write to console in browser
            console.log("Opps, no update has been done.");
        };

        $scope.enableViewAllEvent = true;

        $scope.onViewAllEvent = function() {
            $scope.enableViewAllEvent = false;
            var response = vessel.getVesselHistoryListByVesselId($scope.newVesselObj.vesselId.value)
                .then(onVesselHistoryListSuccess, onVesselHistoryError);
        };

        $scope.getVesselHistory = function(vesselId) {
            var response = vessel.getVesselHistoryListByVesselId(vesselId, 5)
                .then(onVesselHistoryListSuccess, onVesselHistoryError);
        };

        $scope.onVesselHistoryClick = function(vesselHistoryId) {
            var response = vessel.getVesselHistory(vesselHistoryId)
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
    })

    .directive('getvessel', function() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'directive/getVessel/getVessel.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});
