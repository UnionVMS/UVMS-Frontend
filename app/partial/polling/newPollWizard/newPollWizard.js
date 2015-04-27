angular.module('unionvmsWeb').controller('NewpollwizardCtrl',function($scope){

    $scope.wizardStep = 1;

    $scope.nextStep = function(){
        //TODO: check step is valid
        $scope.wizardStep ++;
    };

    $scope.previousStep = function(){
        //TODO: check step is valid
        $scope.wizardStep --;
    };


});