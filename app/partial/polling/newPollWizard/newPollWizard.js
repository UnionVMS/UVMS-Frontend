angular.module('unionvmsWeb').controller('NewpollwizardCtrl',function($scope, pollingService){

    $scope.wizardStep = pollingService.getWizardStep();

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

});