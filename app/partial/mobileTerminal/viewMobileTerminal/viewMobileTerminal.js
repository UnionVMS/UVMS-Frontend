angular.module('unionvmsWeb').controller('viewMobileTerminalCtrl',function($scope, $route, $controller, locale, alertService, mobileTerminalRestService){

    $controller('mobileTerminalFormCtrl', { $scope: $scope });

    $scope.disableSerialNumber = true;

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
});