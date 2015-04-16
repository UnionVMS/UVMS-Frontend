angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, $route, locale, MobileTerminal, mobileTerminalRestService, alertService, $controller){

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
    var createSuccess = function(){
        //Assign to a carrier?
        if($scope.currentMobileTerminal.isAssigned()){
            mobileTerminalRestService.assignMobileTerminal($scope.currentMobileTerminal)
                .then(createAndAssignSuccess, createError);
        }else{
            createAndAssignSuccess();
        }
    };

    var createAndAssignSuccess = function(){
        alertService.showSuccessMessage(locale.getString('mobileTerminal.add_new_alert_message_on_success'));
        setTimeout(function() {
            $route.reload();
        }, 2000 );
    };

    //Error creating the new mobile terminal
    var createError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
    };

    //Error assigning the new mobile terminal
    var assignError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_assign_error'));
        setTimeout(function() {
            $route.reload();
        }, 3000 );        
    };
});

