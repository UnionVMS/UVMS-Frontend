angular.module('unionvmsWeb').controller('newPollWizardCtrl',function($scope, pollingService, alertService, searchService){

    $scope.activeTab = "POLLING";
    $scope.wizardStep = pollingService.getWizardStep();
    $scope.hideAlertsOnScopeDestroy = true;


    $scope.nextStep = function(){
        if($scope.wizardStep <= 2){
            $scope.wizardStep ++;
        }
    };

    $scope.previousStep = function(){
        if($scope.wizardStep >= 2){
            $scope.wizardStep --;
        }
    };

    //Start over and reset
    $scope.startNewPoll = function(){
        $scope.wizardStep = 1;
        pollingService.clearSelection();
        pollingService.resetPollingOptions(true);
    };

    $scope.setHideAlertOnScopeDestroy = function(newVal){
        $scope.hideAlertsOnScopeDestroy = newVal;
    };

    $scope.$on("$destroy", function() {
        if($scope.hideAlertsOnScopeDestroy){
            alertService.hideMessage();
        }
        searchService.reset();
        pollingService.clearSelection();
        pollingService.resetPollingOptions(true);
    });

});