angular.module('unionvmsWeb').controller('NewpollwizardpollingoptionsCtrl',function($scope, alertService, pollingService){

    //The polling options
    $scope.pollingOptions = {
        type : 'MANUAL',
        requestChannel : undefined,
        responseChannel : undefined,
        comment : '',
        programPoll : {
            time : "00:00",
            startDate : undefined,
            endDate : undefined,
        },
        configurationPoll : {
            freq : "00:00",
            gracePeriod : "00:00",
            inPortGrace : "00:00",
            newDNID : "",
            newMemberNo : ""
        }

    };

    //DUMMY DATA FOR DROPDOWNS
    $scope.requestChannels = [];
    $scope.reponseChannels = [];


    $scope.setPollType = function(type){
        if (!$scope.isSingleMobileTerminalSelected && $scope.isSamplingPoll()) {
            return;
        }

        $scope.pollingOptions.type = type;
    };

    $scope.isConfigurationPoll = function(){
        return $scope.pollingOptions.type === 'CONFIGURATION';
    };

    $scope.isProgramPoll = function(){
        return $scope.pollingOptions.type === 'PROGRAM';
    };

    $scope.isManualPoll = function(){
        return $scope.pollingOptions.type === 'MANUAL';
    };

    $scope.isSamplingPoll = function(){
        return $scope.pollingOptions.type === 'SAMPLING';
    };

    //Run the poll
    $scope.runPoll = function(){
        alertService.showInfoMessageWithTimeout("Running poll...");
        $scope.nextStep();
    };

    // Change polling type if incompatible with current selection
    $scope.$watch("wizardStep", function(newValue) {
        if (newValue === 2 && !$scope.isSingleMobileTerminalSelected() && $scope.isSamplingPoll()) {
            $scope.pollingOptions.type = 'MANUAL';
        }
    });

    $scope.isSingleMobileTerminalSelected = function() {
        return pollingService.isSingleSelection();
    };
});
