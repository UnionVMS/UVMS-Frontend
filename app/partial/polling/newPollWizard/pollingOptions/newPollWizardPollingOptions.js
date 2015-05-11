angular.module('unionvmsWeb').controller('NewpollwizardpollingoptionsCtrl',function($scope, locale, alertService, pollingService) {

    //Has form submit been atempted?
    $scope.submitAttempted = false;

    //The polling options
    $scope.pollingOptions = pollingService.getPollingOptions();

    var resetPollingOptions = function(resetComment){
        pollingService.resetPollingOptions(resetComment);
    };

    var init = function(){
        resetPollingOptions(true);
    };    

    //DUMMY DATA FOR DROPDOWNS
    $scope.requestChannels = [];
    $scope.reponseChannels = [];

    $scope.setPollType = function(type){
        if (!$scope.isSingleMobileTerminalSelected() && type === "SAMPLING") {
            return;
        }
        resetPollingOptions(false);
        $scope.submitAttempted = false;
        $scope.pollingOptions.type = type;
    };

    //Is configuration poll selected?
    $scope.isConfigurationPoll = function(){
        return $scope.pollingOptions.type === 'CONFIGURATION';
    };

    //Is program poll selected?
    $scope.isProgramPoll = function(){
        return $scope.pollingOptions.type === 'PROGRAM';
    };

    //Is manual poll selected?
    $scope.isManualPoll = function(){
        return $scope.pollingOptions.type === 'MANUAL';
    };

    //Is sampling poll selected?
    $scope.isSamplingPoll = function(){
        return $scope.pollingOptions.type === 'SAMPLING';
    };

    //Get number of selected terminals
    $scope.getNumberOfSelectedTerminals = function(){
        return pollingService.getNumberOfSelectedTerminals();
    };

    //Is a single mobile terminal selected?
    $scope.isSingleMobileTerminalSelected = function() {
        return pollingService.isSingleSelection();
    };

    //Run the poll
    $scope.runPoll = function(){
        $scope.submitAttempted = true;
        if($scope.pollingOptionsForm.$valid){
            alertService.showInfoMessageWithTimeout("Running poll...");
            pollingService.createPolls().then(function() {
                $scope.nextStep();
            });
        }else{
            alertService.showErrorMessage(locale.getString('common.alert_message_on_form_validation_error'));
        }
    };

    //Watch when entering optins step in the wizard
    $scope.$watch("wizardStep", function(newValue) {
        if (newValue === 2) {
            //Reset form and submitAttempted
            $scope.submitAttempted = false;
            $scope.pollingOptionsForm.$setPristine();

            // Change polling type if incompatible with current selection
             if(!$scope.isSingleMobileTerminalSelected() && $scope.isSamplingPoll()){
                $scope.pollingOptions.type = 'MANUAL';
            }
        }
    });

    //Watch number of selected mobile terminals and go back to step 1 when all terminals are removed
    $scope.$watch(function(){return pollingService.getNumberOfSelectedTerminals();}, function(newValue) {
        if ($scope.wizardStep === 2 && newValue === 0) {
           $scope.previousStep();
        }
    });


    init();
});
