angular.module('unionvmsWeb').controller('VesselFormCtrl',function($scope, $modal, Vessel, vesselRestService, alertService, locale){

    //Keep track of visibility statuses
    $scope.isVisible = {
        showCompleteVesselHistoryLink : false,
    };

    //Watch for changes to the vesselObj
    //$scope.$watch(function () { return $scope.vesselObj;}, function (newVal, oldVal) {
    $scope.$watch('getVesselObj()', function(newVal) {
        $scope.vesselObj = $scope.getVesselObj();
        if (typeof newVal !== 'undefined') {
            if(!$scope.isCreateNewMode()){
                getVesselHistory();
            }
        }
    });  

    $scope.waitingForCreateResponse = false;

    //MOCK FUNCTION
    $scope.addNewMobileTerminalToVessel = function () {
        alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
    };

    //Toggle the vessel status
    $scope.changeVesselStatus = function(){
        $scope.vesselObj.active = !$scope.vesselObj.active;
        alertService.showInfoMessageWithTimeout('You need to click "Update" to persist the status change');
    };

    //Create a new vessel
    $scope.createNewVessel = function(){
        if($scope.vesselForm.$valid) {
            //Create new Vessel
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();
            vesselRestService.createNewVessel($scope.vesselObj)
                .then(createVesselSuccess, createVesselError);
        }else{
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_form_validation_error'));
        }
    };

    //Success creating the new vessel
    var createVesselSuccess = function(createdVessel){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.add_new_alert_message_on_success'));
        $scope.vesselObj = createdVessel;
        $scope.setCreateMode(false);
        getVesselHistory();
    };

    //Error creating the new vessel
    var createVesselError = function(error){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_error'));
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.vesselObj = new Vessel();
    };    

    //Update the Vessel
    $scope.updateVessel = function(){
        if($scope.vesselForm.$valid) {
            //MobileTerminals remove them cuz they do not exist in backend yet.
            delete $scope.vesselObj.mobileTerminals; 

            //Update Vessel and take care of the response(eg. the promise) when the update is done.
            alertService.hideMessage();
            var updateResponse = vesselRestService.updateVessel($scope.vesselObj)
                .then(updateVesselSuccess, updateVesselError);            
        }else{
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_form_validation_error'));
        }
    };

    //Is the name of the vessel set?
    $scope.isVesselNameSet = function(){
        return angular.isDefined($scope.vesselObj) && angular.isDefined($scope.vesselObj.name) && $scope.vesselObj.name.trim().length > 0;
    };

    //Vessel was successfully updated
    var updateVesselSuccess = function(updatedVessel){
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.update_alert_message_on_success'));
        $scope.vesselObj = updatedVessel;
        $scope.mergeCurrentVesselIntoSearchResults();
        getVesselHistory();
    };
    //Error updating vessel
    var updateVesselError = function(error){
        alertService.showErrorMessage(locale.getString('vessel.update_alert_message_on_error'));
    };

    //Get all history events for the vessel
    $scope.viewCompleteVesselHistory = function() {
        $scope.isVisible.showCompleteVesselHistoryLink = false;
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value)
            .then(onCompleteVesselHistoryListSuccess, onVesselHistoryListError);        
    };

    //Get first 5 history events for the vessel
    var vesselHistorySize = 5;
    var getVesselHistory = function() {
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value, vesselHistorySize)
            .then(onVesselHistoryListSuccess, onVesselHistoryListError);
    };

    //Success getting vessel history
    var onVesselHistoryListSuccess = function(vesselHistory) {
        $scope.vesselHistory = vesselHistory;
        if($scope.vesselHistory.length === vesselHistorySize){
            $scope.isVisible.showCompleteVesselHistoryLink = true;
        }
    };

    //Success getting complete vessel history
    var onCompleteVesselHistoryListSuccess = function(vesselHistory){
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