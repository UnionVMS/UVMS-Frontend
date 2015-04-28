angular.module('unionvmsWeb').controller('NewpollwizardCtrl',function($scope, pollingService){

    $scope.wizardStep = 1;

    $scope.nextStep = function(){
        //TODO: check step is valid
        $scope.wizardStep ++;
    };

    $scope.previousStep = function(){
        //TODO: check step is valid
        $scope.wizardStep --;
    };

    //Start over and reset
    $scope.startNewPoll = function(){
        $scope.wizardStep = 1;
        pollingService.clearSelection();
    };


});