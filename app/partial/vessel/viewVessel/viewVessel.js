angular.module('unionvmsWeb').controller('ViewVesselCtrl',function($scope, $modal, vesselRestService, alertService, locale){

    //Keep track of visibility statuses
    $scope.isVisible = {
        showCompleteVesselHistoryLink : true,
    };

    //Watch for changes to the vesselObj
    $scope.$watch(function () { return $scope.vesselObj;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.isVisible.showCompleteVesselHistoryLink = true;
            getVesselHistory($scope.vesselObj.vesselId.value);
        }
    });   

    //MOCK FUNCTION
    $scope.addNewMobileTerminalToVessel = function () {
        alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
    };

    //Toggle the vessel status
    $scope.changeVesselStatus = function(){
        $scope.vesselObj.active = !$scope.vesselObj.active;
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
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.update_alert_message_on_success'));
    };
    //Error updating vessel
    var updateVesselError = function(error){
        alertService.showErrorMessage(locale.getString('vessel.update_alert_message_on_error'));
    };

    //Get all history events for the vessel
    $scope.viewCompleteVesselHistory = function() {
        $scope.isVisible.showCompleteVesselHistoryLink = false;
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value)
            .then(onVesselHistoryListSuccess, onVesselHistoryListError);        
    };

    //Get first 5 history events for the vessel
    var getVesselHistory = function(vesselId) {
        vesselRestService.getVesselHistoryListByVesselId(vesselId, 5)
            .then(onVesselHistoryListSuccess, onVesselHistoryListError);
    };

    //Success getting vessel history
    var onVesselHistoryListSuccess = function(vesselHistory) {
        $scope.vesselHistory = vesselHistory;
    };

    //Error getting vessel history
    var onVesselHistoryListError = function(error) {
        console.error("Error getting vessel history");
    };                      

    //View history details
    $scope.viewHistoryDetails = function(vesselHistory) {
        $scope.currentVesselHistory = vesselHistory;
        openVesselHistoryModal();
    };

    //Open modal for viewing history details
    var openVesselHistoryModal = function(){
        var modalInstance = $modal.open({
          templateUrl: 'partial/vessel/vesselHistory/vesselHistoryModal/vesselHistoryModal.html',
          controller: 'VesselhistorymodalCtrl',
          size: "small",
          resolve: {
            vesselHistory: function() {
                return $scope.currentVesselHistory;
            }
          }
        });
    };

});