angular.module('unionvmsWeb').controller('RunningProgramPollsCtrl',function($scope, pollingRestService, alertService, locale){

    //Search objects and results
    $scope.currentSearchResults = {
        programPolls : [],
        errorMessage : "",
        loading : true,
        sortBy : "",
        sortReverse : ""
    };   

    //Init function when entering page
    var init = function(){
        //Get list of running program polls
        pollingRestService.getRunningProgramPolls().then(getRunningPollsSuccess, getRunningPollsFail);
    };

    //Success getting running program polls
    var getRunningPollsSuccess = function(runningPolls){
        $scope.currentSearchResults.loading = false;
        if(runningPolls.length > 0){
            $scope.currentSearchResults.programPolls = runningPolls;
        }else{
            $scope.currentSearchResults.errorMessage = locale.getString("polling.running_program_polls_zero_message");
        }
    };

    //Error getting running program polls
    var getRunningPollsFail = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString("polling.running_program_polls_error_message");
    };

    //Update (replace) a program poll in the array of program polls
    var updateProgramPollInResultsArray = function(oldProgramPoll, updatedProgramPoll){
        var programPollIndex = $scope.currentSearchResults.programPolls.indexOf(oldProgramPoll);
        $scope.currentSearchResults.programPolls[programPollIndex] = updatedProgramPoll;
    };

    //Start a program poll
    $scope.startProgramPoll = function(programPoll){
        if($scope.possibleToStart(programPoll)){
            pollingRestService.startProgramPoll(programPoll).then(
                function(updatedProgramPoll){
                    //TODO: remove next two lines when backend is working
                    updatedProgramPoll.running = true;

                    updateProgramPollInResultsArray(programPoll, updatedProgramPoll);
                },
                function(error){
                    alertService.showErrorMessage(locale.getString('polling.running_program_polls_start_error'));
                }
            );
        }
    };

    //Stop a program poll    
    $scope.stopProgramPoll = function(programPoll){
        if($scope.possibleToStop(programPoll)){
            pollingRestService.stopProgramPoll(programPoll).then(
                function(updatedProgramPoll){
                    //TODO: remove next two lines when backend is working
                    updatedProgramPoll.running = false;

                    updateProgramPollInResultsArray(programPoll, updatedProgramPoll);
                },
                function(error){
                    alertService.showErrorMessage(locale.getString('polling.running_program_polls_stop_error'));
                }
            );
        }
    };

    //Delete a program poll    
    $scope.deleteProgramPoll = function(programPoll){   
        pollingRestService.inactivateProgramPoll(programPoll).then(
            function(updatedProgramPoll){
                //Remove program poll from list
                var programPollIndex = $scope.currentSearchResults.programPolls.indexOf(programPoll);
                $scope.currentSearchResults.programPolls.splice(programPollIndex, 1);                

                alertService.showSuccessMessageWithTimeout(locale.getString('polling.running_program_polls_delete_success'));
                if($scope.currentSearchResults.programPolls.length === 0){
                    $scope.currentSearchResults.errorMessage = locale.getString("polling.running_program_polls_zero_message");
                }                
            },
            function(error){
                alertService.showErrorMessage(locale.getString('polling.running_program_polls_delete_error'));
            }
        );
    };    

    //Is it possible to start this program?
    $scope.possibleToStart = function(programPoll){
        if(programPoll.attributes.RUNNING === "STARTED"){
            return false;
        }

        //Is the current date and time between the startDate and endDate of the program
        var now = Date.now();
        if (programPoll.attributes.START_DATE <= now && now <= programPoll.attributes.END_DATE) {
            return true;
        }
        return false;   
    };

    //Is it possible to stop this program?
    $scope.possibleToStop = function(programPoll){
        return programPoll.attributes.RUNNING === "STARTED";
    };

    init();

});