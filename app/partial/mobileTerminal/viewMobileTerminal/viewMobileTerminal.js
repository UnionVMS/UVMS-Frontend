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



    //Success creating the new mobile terminal
    var updateSuccess = function(){
        //Assign to a carrier?
        if($scope.currentMobileTerminal.hasAssignedCarrierBeenUpdated()){
            //Check if the mobile temrinal has been assigned to a new carrier or been unassigned
            if($scope.currentMobileTerminal.isAssigned()){
                //Assign
                mobileTerminalRestService.assignMobileTerminal($scope.currentMobileTerminal)
                    .then(updateAndAssignSuccess, assignError);
            }
            else{
                //Unassign
                mobileTerminalRestService.unassignMobileTerminal($scope.currentMobileTerminal)
                    .then(updateAndAssignSuccess, assignError);            
            }
        }else{
            updateAndAssignSuccess();
        }
    };

    var updateAndAssignSuccess = function(){
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));
        setTimeout(function() {
            $route.reload();
        }, 2000 );
    };

    //Error creating the new mobile terminal
    var updateError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_error'));
    };

    //Error assigning the new mobile terminal
    var assignError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_assign_error'));     
    };




});