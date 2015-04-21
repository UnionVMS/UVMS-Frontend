angular.module('unionvmsWeb').controller('viewMobileTerminalCtrl',function($scope, $route, $controller, locale, alertService, mobileTerminalRestService){

    $controller('mobileTerminalFormCtrl', { $scope: $scope });

    $scope.disableSerialNumber = true;

    //Watch for changes to the vesselObj
    $scope.$watch(function () { return $scope.currentMobileTerminal;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            console.log("new mobile view");
            //Remove history items
            $scope.currentMobileTerminalHistory = [];

            //Get new history
            if($scope.currentMobileTerminal.hasInternalId()){
                getMobileTerminalHistoryForCurrentMobileTerminal();
            }
        }
    });       

    //Update the mobile terminal
    $scope.updateMobileTerminal = function(){
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
        mobileTerminalRestService.updateMobileTerminal($scope.currentMobileTerminal)
                .then(updateSuccess, updateError);
    };

    var updateSuccess = function(){
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));
    };

    //Error creating the new mobile terminal
    var updateError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_error'));
    };

    //Handle click event on inactive link
    $scope.setStatusToInactive = function(){
        console.log("Set status to inactive");
        mobileTerminalRestService.inactivateMobileTerminal($scope.currentMobileTerminal).then(setStatusToInactiveSuccess, setStatusToInactiveError);
    };

    //Inactivate status success
    function setStatusToInactiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessage(locale.getString('mobileTerminal.inactivate_message_on_success'));
        //Update the mobileTerminal object with the returned one
        $scope.currentMobileTerminal = updatedMobileTerminal;
    }

    function setStatusToInactiveError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.inactivate_message_on_error'));
    }

    //Handle click event on activate link
    $scope.setStatusToActive = function(){
        mobileTerminalRestService.activateMobileTerminal($scope.currentMobileTerminal).then(setStatusToActiveSuccess, setStatusToActiveError);
    };

    //Activate status success
    function setStatusToActiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessage(locale.getString('mobileTerminal.activate_message_on_success'));
        //Update the mobileTerminal object with the returned one
        $scope.currentMobileTerminal = updatedMobileTerminal;
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
    };

    //Error getting history
    var onGetMobileTerminalHistoryError = function(error) {
        alertService.showErrorMessage(locale.getString('mobileTerminal.history_alert_message_on_failed_to_load_error'));
    };    

});