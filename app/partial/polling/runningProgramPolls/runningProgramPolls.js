angular.module('unionvmsWeb').controller('RunningProgramPollsCtrl',function($scope, ProgramPoll, pollingRestService, alertService, locale){

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

    //Start a program poll
    $scope.startProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Start of program poll will soon be available. Stay tuned!");
        programPoll.start();
    };

    //Stop a program poll    
    $scope.stopProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Stop of program poll will soon be available. Stay tuned!");
        programPoll.stop();
    };

    //Delete a program poll    
    $scope.deleteProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Delete of program poll will soon be available. Stay tuned!");
    };

    init();

});