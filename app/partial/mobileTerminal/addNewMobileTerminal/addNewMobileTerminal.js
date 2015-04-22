angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, locale, MobileTerminal, mobileTerminalRestService, alertService, $controller){

    $controller('mobileTerminalFormCtrl', { $scope: $scope });

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
        mobileTerminalRestService.createNewMobileTerminal($scope.currentMobileTerminal)
                .then(createSuccess, createError);
    };

    //Success creating the new mobile terminal
    var createSuccess = function(terminalObject) {
        $scope.currentMobileTerminal = MobileTerminal.fromJson(terminalObject);
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.add_new_alert_message_on_success'));

        var noHideMessage = true;
        $scope.toggleAddNewMobileTerminal(noHideMessage);
        $scope.toggleMobileTerminalDetails($scope.currentMobileTerminal, noHideMessage);
    };

    //Error creating the new mobile terminal
    var createError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
    };
});
