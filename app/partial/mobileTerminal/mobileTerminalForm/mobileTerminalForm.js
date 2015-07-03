angular.module('unionvmsWeb').controller('mobileTerminalFormCtrl',function($scope, $route, $modal, locale, MobileTerminal, alertService, mobileTerminalRestService, modalComment){

    //Visibility statuses
    $scope.isVisible = {
        assignVessel : false,
    };

    $scope.typeAndLES = undefined;
    //Watch changes to the currentMobileTerminal model (set in the parent scope)
    $scope.$watch('getCurrentMobileTerminal()', function(newValue) {
        $scope.currentMobileTerminal = $scope.getCurrentMobileTerminal();
        if(angular.isDefined($scope.mobileTerminalForm)){
            $scope.mobileTerminalForm.$setPristine();
            $scope.submitAttempted = false;

            //Update the value for typeAndLES in order for the dropdown to show the correct value
            if(angular.isDefined($scope.currentMobileTerminal)){
                $scope.typeAndLES = $scope.getModelValueForTransponderSystemBySystemTypeAndLES($scope.currentMobileTerminal.type, $scope.currentMobileTerminal.attributes.LES);
            }
        }
    });    

    //Has form submit been atempted?
    $scope.submitAttempted = false;
    $scope.waitingForCreateResponse = false;

    //Get terminal config for the selected terminal type
    $scope.getTerminalConfig = function(item){
        if(angular.isDefined($scope.currentMobileTerminal)){
            var systemName = $scope.currentMobileTerminal.type;
            return $scope.transpondersConfig.getTerminalConfigBySystemName(systemName);
        }
    };

    //Selected terminal
    $scope.onTerminalSystemSelect = function(selectedItem){
        if(angular.isDefined(selectedItem) && angular.isDefined(selectedItem.typeAndLes)){
            $scope.currentMobileTerminal.type = selectedItem.typeAndLes.type;
            var selectedLES = selectedItem.typeAndLes.les;
            if(angular.isDefined(selectedLES)){
                $scope.currentMobileTerminal.attributes.LES = selectedLES;
                $.each($scope.currentMobileTerminal.channels, function(index, channel){
                    channel.setLESDescription(selectedLES);
                });
            }else{
                delete $scope.currentMobileTerminal.attributes.LES;
            }
        }else{
            $scope.currentMobileTerminal.type = undefined;
            delete $scope.currentMobileTerminal.attributes.LES;
        }
    };    

    $scope.isDirty = function() {
        var isDirty = !$scope.currentMobileTerminal.isEqualAttributesAndChannels($scope.getOriginalMobileTerminal());
        return isDirty;
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.currentMobileTerminal = new MobileTerminal();
    };

    //Create the mobile terminal
    $scope.createNewMobileTerminal = function(){
        $scope.submitAttempted = true;        

        //Validate form
        if(!$scope.mobileTerminalForm.$valid){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_form_validation_error'));
            return false;
        }

        //Validate at least one channel
        if($scope.currentMobileTerminal.channels.length === 0){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_channels_missing_validation_error'));
            return false;            
        }
        
        //Create
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        mobileTerminalRestService.createNewMobileTerminal($scope.currentMobileTerminal)
                .then(createNewMobileTerminalSuccess, createNewMobileTerminalError);
    };

    //Success creating the new mobile terminal
    var createNewMobileTerminalSuccess = function(mobileTerminal) {
        $scope.waitingForCreateResponse = false;
        $scope.currentMobileTerminal = mobileTerminal;
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.add_new_alert_message_on_success'));

        $scope.setCreateMode(false);
    };

    //Error creating the new mobile terminal
    var createNewMobileTerminalError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
    };

    //Update
    $scope.updateMobileTerminal = function() {
        modalComment.open($scope.updateMobileTerminalWithComment, {
            titleLabel: locale.getString("mobileTerminal.updating", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString("common.update")
        });
    };

    //Update the mobile terminal
    $scope.updateMobileTerminalWithComment = function(comment){
        $scope.submitAttempted = true;

        //Validate form
        if(!$scope.mobileTerminalForm.$valid){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_form_validation_error'));
            return false;
        }

        //Validate at least one channel
        if($scope.currentMobileTerminal.channels.length === 0){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_channels_missing_validation_error'));
            return false;            
        }
        
        //Update
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        mobileTerminalRestService.updateMobileTerminal($scope.currentMobileTerminal, comment)
                .then(updateMobileTerminalSuccess, updateMobileTerminalError);
    };

    var updateMobileTerminalSuccess = function(updatedMobileTerminal){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));

        //Update values in the currentMobileTerminal object
        $scope.currentMobileTerminal.setAttributes(updatedMobileTerminal.attributes);
        $scope.currentMobileTerminal.setChannels(updatedMobileTerminal.channels);
        $scope.currentMobileTerminal.guid = updatedMobileTerminal.guid;
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    };

    //Error creating the new mobile terminal
    var updateMobileTerminalError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_error'));
    };

    //Handle click event on inactive link
    $scope.setStatusToInactiveWithComment = function(comment){
        mobileTerminalRestService.inactivateMobileTerminal($scope.currentMobileTerminal, comment).then(setStatusToInactiveSuccess, setStatusToInactiveError);
    };

    $scope.setStatusToInactive = function() {
        modalComment.open($scope.setStatusToInactiveWithComment, {
            titleLabel: locale.getString("mobileTerminal.set_inactive", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString('mobileTerminal.inactivate_link')
        });
    };

    //Inactivate status success
    function setStatusToInactiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.inactivate_message_on_success'));

        //Update active status in the currentMobileTerminal object
        $scope.currentMobileTerminal.setActive(updatedMobileTerminal.active);
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    }

    function setStatusToInactiveError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.inactivate_message_on_error'));
    }

    //Handle click event on activate link
    $scope.setStatusToActiveWithComment = function(comment){
        mobileTerminalRestService.activateMobileTerminal($scope.currentMobileTerminal, comment).then(setStatusToActiveSuccess, setStatusToActiveError);
    };

    $scope.setStatusToActive = function() {
        modalComment.open($scope.setStatusToActiveWithComment, {
            titleLabel: locale.getString("mobileTerminal.set_active", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString('mobileTerminal.activate_link')
        });
    };

    //Activate status success
    function setStatusToActiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.activate_message_on_success'));

        //Update active status in the currentMobileTerminal object
        $scope.currentMobileTerminal.setActive(updatedMobileTerminal.active);        
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    }

    function setStatusToActiveError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.activate_message_on_error'));
    }    

    //Get the history list for the mobile terminal
    var getMobileTerminalHistoryForCurrentMobileTerminal = function() {
        var response = mobileTerminalRestService.getHistoryForMobileTerminal($scope.currentMobileTerminal)
            .then(onGetMobileTerminalHistorySuccess, onGetMobileTerminalHistoryError);
    };

    //Success getting history
    var onGetMobileTerminalHistorySuccess = function(historyList) {
        $scope.currentMobileTerminalHistory = historyList;
         openMobileTerminalHistoryModal($scope.currentMobileTerminalHistory, $scope.currentMobileTerminal);

    };

    //Error getting history
    var onGetMobileTerminalHistoryError = function(error) {
        alertService.showErrorMessage(locale.getString('mobileTerminal.history_alert_message_on_failed_to_load_error'));
    };

    //Historymodal
    $scope.onMobileTerminalHistoryClick = function(){
        //TODO: add carriername...
         getMobileTerminalHistoryForCurrentMobileTerminal();
    };

    var openMobileTerminalHistoryModal = function(currentMobileTerminalHistory, mobileTerminal) {

        var modalInstance = $modal.open({
          templateUrl: 'partial/mobileTerminal/mobileTerminalHistoryModal/mobileTerminalHistoryModal.html',
          controller: 'mobileTerminalHistoryModalCtrl',
          size: "lg",
          resolve: {
            currentMobileTerminalHistory: function() {
                return currentMobileTerminalHistory;
            },
            mobileTerminal: function(){
                return mobileTerminal;
            }
          }
        });

        modalInstance.result.then(function () {
        }, function () {
          //Nothing on cancel
        });
    };   

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        $scope.currentMobileTerminal.addNewChannel();
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.currentMobileTerminal.removeChannel(channelIndex);
    };

    $scope.selectChannel = function(capability, selected) {
        for (var i = 0; i < $scope.currentMobileTerminal.channels.length; i++) {
            if (selected !== undefined) {
                $scope.currentMobileTerminal.channels[i].capabilities[capability] = selected === i;
            }
            else {
                if ($scope.currentMobileTerminal.channels[i].capabilities[capability]) {
                    return i;
                }
            }
        }
    };

    $scope.selectedConfigChannel = function(selected) {
        return $scope.selectChannel("CONFIGURABLE", selected);
    };

    $scope.selectedDefaultChannel = function(selected) {
        return $scope.selectChannel("DEFAULT_REPORTING", selected);
    };

    $scope.selectedPollingChannel = function(selected) {
        return $scope.selectChannel("POLLABLE", selected);
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.currentMobileTerminal.channels.splice(newIndex, 0, $scope.currentMobileTerminal.channels.splice(oldIndex, 1)[0]);
    };

    $scope.unassignVessel = function() {
        var vesselName = "";
        if(angular.isDefined($scope.currentMobileTerminal.associatedVessel)){
            vesselName = $scope.currentMobileTerminal.associatedVessel.name;
        }
        modalComment.open($scope.unassignVesselWithComment, {
            titleLabel: locale.getString("mobileTerminal.unassigning_from_vessel", [$scope.currentMobileTerminal.getSerialNumber(), vesselName]),
            saveLabel: locale.getString("mobileTerminal.unassign")
        });
    };

    $scope.unassignVesselWithComment = function(comment) {
        mobileTerminalRestService.unassignMobileTerminal($scope.currentMobileTerminal, comment).then(function(res) {
            // Success
            $scope.currentMobileTerminal.unassign();
            $scope.mergeCurrentMobileTerminalIntoSearchResults();
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.unassign_vessel_message_on_success'));
        }, 
        function(res) {
            // Error
            alertService.showErrorMessage(locale.getString('mobileTerminal.unassign_vessel_message_on_error'));
        });
    };

    //Show/hide assign vessel
    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };
});