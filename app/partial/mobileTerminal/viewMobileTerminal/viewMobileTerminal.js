angular.module('unionvmsWeb').controller('viewMobileTerminalCtrl',function($scope, $route, $controller, $modal, locale, alertService, mobileTerminalRestService, modalComment){

    $controller('mobileTerminalFormCtrl', { $scope: $scope });

    $scope.disableSerialNumber = true;

    //Watch for changes to the vesselObj
    $scope.$watch(function () { return $scope.currentMobileTerminal;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {

        }
    });       

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
        mobileTerminalRestService.updateMobileTerminal($scope.currentMobileTerminal, comment)
                .then(updateSuccess, updateError);
    };

    $scope.updateMobileTerminal = function() {
        modalComment.open($scope.updateMobileTerminalWithComment, {
            titleLabel: locale.getString("mobileTerminal.updating", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString("common.update")
        });
    };

    var updateSuccess = function(){
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));
    };

    //Error creating the new mobile terminal
    var updateError = function(){
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
        //Update the mobileTerminal object with the returned one
        $scope.currentMobileTerminal = updatedMobileTerminal;
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
         openMobileTerminalHistoryModal($scope.currentMobileTerminalHistory, $scope.currentMobileTerminal.mobileTerminalId);

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

   var openMobileTerminalHistoryModal = function(currentMobileTerminalHistory, mobileTerminalId){
            
            var modalInstance = $modal.open({
              templateUrl: 'partial/mobileTerminal/mobileTerminalHistoryModal/mobileTerminalHistoryModal.html',
              controller: 'mobileTerminalHistoryModalCtrl',
              size: "lg",
              resolve: {
                currentMobileTerminalHistory: function() {
                    return currentMobileTerminalHistory;
                },
                mobileTerminalId: function(){
                    return mobileTerminalId;
                }
              }
            });

            modalInstance.result.then(function () {
            }, function () {
              //Nothing on cancel
            });
        };

});