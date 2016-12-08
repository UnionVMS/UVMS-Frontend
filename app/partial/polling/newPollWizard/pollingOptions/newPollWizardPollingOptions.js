/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('NewpollwizardpollingoptionsCtrl',function($scope, $state, locale, alertService, pollingService, dateTimeService) {

    //Has form submit been atempted?
    $scope.submitAttempted = false;

    //Currently waiting for response?
    $scope.loadingResult = false;
    $scope.loadingMessage = locale.getString('polling.wizard_second_step_creating_polls');

    //The polling options
    $scope.pollingOptions = pollingService.getPollingOptions();

    //Set min date for program polls. Start date for a program must be in the future
    var setProgramPollMinDate = function(){
        $scope.programPollMinDate = dateTimeService.formatUTCDateWithTimezone(moment.utc().format());
    };

    var resetPollingOptions = function(resetComment){
        pollingService.resetPollingOptions(resetComment);
    };

    var init = function(){
        resetPollingOptions(true);
        setProgramPollMinDate();
    };

    $scope.setPollType = function(type){
        if (!$scope.isSingleMobileTerminalSelected() && type === "SAMPLING") {
            return;
        }
        if (!$scope.isAllSelectedTerminalsOfTheSameType() && type === "CONFIGURATION") {
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

    //Is all selected terminals of the same type?
    $scope.isAllSelectedTerminalsOfTheSameType = function() {
        var selectedTerminals = pollingService.getSelectedChannels();
        if(selectedTerminals.length > 1){
            for(var i = 1; i < selectedTerminals.length ; i++){
                if(selectedTerminals[i].mobileTerminalType !== selectedTerminals[i-1].mobileTerminalType){
                    return false;
                }
            }
        }
        return true;
    };

    //Get the terminal type of the first selected channel
    var getTerminalTypeOfFirstSelectedTerminal = function(){
        var selectedTerminals = pollingService.getSelectedChannels();
        if(selectedTerminals.length > 0){
            return selectedTerminals[0].mobileTerminalType;
        }
    };

    $scope.enableConfigurationForInmarsatC = function(){
        return getTerminalTypeOfFirstSelectedTerminal() === 'INMARSAT_C';
    };

    $scope.enableConfigurationForIridium = function(){
        return getTerminalTypeOfFirstSelectedTerminal() === 'IRIDIUM';
    };

    //Run the poll
    $scope.runPoll = function(){
        $scope.submitAttempted = true;
        alertService.hideMessage();
        if($scope.pollingOptionsForm.$valid){
            var options = pollingService.getPollingOptions();
            var attributes = pollingService.getPollAttributes(options.type);
            if (options.type !== 'MANUAL' && attributes.length === 0) {
                alertService.showErrorMessage(locale.getString('polling.wizard_second_step_error_at_least_one_attribute_needed'));
                return;
            }
            $scope.loadingResult = true;
            pollingService.createPolls().then(
                function() {
                    $scope.loadingResult = false;
                    pollingService.clearSelection();
                    var pollResult = pollingService.getResult();
                    var redirectPage;
                    //Any unsent polls?
                    if(pollResult.unsentPolls.length > 0){
                        redirectPage = 'app.exchange';
                        var total = pollResult.sentPolls.length + pollResult.unsentPolls.length;
                        alertService.showErrorMessage(locale.getString('polling.wizard_second_step_creating_polls_unsent_error',{unsent : pollResult.unsentPolls.length, total: total}));
                    }else{
                        redirectPage = 'app.pollingLogs';
                        var successMessage = locale.getString('polling.wizard_second_step_success_single');
                        if(!pollResult.programPoll && pollResult.sentPolls.length > 1){
                            successMessage = locale.getString('polling.wizard_second_step_success_multiple');
                        }else if(pollResult.programPoll && pollResult.sentPolls.length === 1){
                            successMessage = locale.getString('polling.wizard_second_step_success_program_single');
                        }else if(pollResult.programPoll && pollResult.sentPolls.length > 1){
                            successMessage = locale.getString('polling.wizard_second_step_success_program_multiple');
                        }
                        alertService.showSuccessMessageWithTimeout(successMessage);
                    }

                    //Show success alert and redirect to polling logs page
                    $scope.setHideAlertOnScopeDestroy(false);
                    $state.go(redirectPage);
                },
                function(){
                    //Error
                    alertService.showErrorMessage(locale.getString('polling.wizard_second_step_creating_polls_error'));
                    $scope.loadingResult = false;
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

            //Update programPollMinDate
            setProgramPollMinDate();

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