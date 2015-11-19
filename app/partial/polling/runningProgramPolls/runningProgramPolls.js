angular.module('unionvmsWeb').controller('RunningProgramPollsCtrl',function($scope, pollingRestService, alertService, locale, SearchResults, SearchResultListPage, userService){

    //Does the user have access to start/stop/delete program polls?
    $scope.accessToManagePolls = userService.isAllowed('managePolls', 'Union-VMS', true);

    $scope.currentSearchResults = new SearchResults('attributes.VESSEL_NAME', false, locale.getString('polling.running_program_polls_zero_message'));

    //Init function when entering page
    var init = function(){
        //Get list of running program polls
        $scope.currentSearchResults.setLoading(true);
        pollingRestService.getRunningProgramPolls().then(getRunningPollsSuccess, getRunningPollsFail);
    };

    //Success getting running program polls
    var getRunningPollsSuccess = function(runningPolls){
        $scope.currentSearchResults.setLoading(false);
        var page = new SearchResultListPage(runningPolls);
        if(runningPolls.length > 0){
            page.currentPage = undefined;
            page.totalNumberOfPages = undefined;
        }
        $scope.currentSearchResults.updateWithNewResults(page);
    };

    //Error getting running program polls
    var getRunningPollsFail = function(error){
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('polling.running_program_polls_error_message'));
    };

    //Update (replace) a program poll in the array of program polls
    var updateProgramPollInResultsArray = function(oldProgramPoll, updatedProgramPoll){
        var programPollIndex = $scope.currentSearchResults.items.indexOf(oldProgramPoll);
        $scope.currentSearchResults.items[programPollIndex] = updatedProgramPoll;
    };

    // Start a program poll
    $scope.startProgramPoll = function(programPoll){
        if($scope.accessToManagePolls){
            if($scope.possibleToStart(programPoll)){
                pollingRestService.startProgramPoll(programPoll).then(
                    function(updatedProgramPoll){
                        updateProgramPollInResultsArray(programPoll, updatedProgramPoll);
                    },
                    function(error){
                        alertService.showErrorMessage(locale.getString('polling.running_program_polls_start_error'));
                    }
                );
            }
        }
    };

    // Stop a program poll
    $scope.stopProgramPoll = function(programPoll){
        if($scope.accessToManagePolls){
            if($scope.possibleToStop(programPoll)){
                pollingRestService.stopProgramPoll(programPoll).then(
                    function(updatedProgramPoll){
                        updateProgramPollInResultsArray(programPoll, updatedProgramPoll);
                    },
                    function(error){
                        alertService.showErrorMessage(locale.getString('polling.running_program_polls_stop_error'));
                    }
                );
            }
        }
    };

    //Delete a program poll
    $scope.deleteProgramPoll = function(programPoll){
        if($scope.accessToManagePolls){
            pollingRestService.inactivateProgramPoll(programPoll).then(
                function(updatedProgramPoll){
                    //Remove program poll from list
                    var programPollIndex = $scope.currentSearchResults.items.indexOf(programPoll);
                    $scope.currentSearchResults.items.splice(programPollIndex, 1);

                    alertService.showSuccessMessageWithTimeout(locale.getString('polling.running_program_polls_delete_success'));
                    if($scope.currentSearchResults.items.length === 0){
                        $scope.currentSearchResults.errorMessage = locale.getString("polling.running_program_polls_zero_message");
                    }
                },
                function(error){
                    alertService.showErrorMessage(locale.getString('polling.running_program_polls_delete_error'));
                }
            );
        }
    };

    //Is it possible to start this program?
    $scope.possibleToStart = function(programPoll){
        if(programPoll.attributes.PROGRAM_RUNNING === "TRUE"){
            return false;
        }

        //Is the current date and time between the startDate and endDate of the program
        var now = Date.now();
        return new Date(programPoll.attributes.START_DATE) <= now && now <= new Date(programPoll.attributes.END_DATE);
    };

    //Is it possible to stop this program?
    $scope.possibleToStop = function(programPoll){
        var now = Date.now();
        return programPoll.attributes.PROGRAM_RUNNING === "TRUE" && now >= new Date(programPoll.attributes.START_DATE);
    };

    init();

});