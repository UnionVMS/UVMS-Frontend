angular.module('unionvmsWeb').controller('RunningProgramPollsCtrl',function($scope, ProgramPoll, alertService){


    //Search objects and results
    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        programPolls : [],
        errorMessage : "",
        loading : false,
        sortBy : "",
        sortReverse : ""
    };   

    //Init function when entering page
    var init = function(){
        //TODO: Load list with program polls

        //Add 3 dummy polls
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());

    };

    $scope.startProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Start of program poll will soon be available. Stay tuned!");
        programPoll.start();
    };

    $scope.stopProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Stop of program poll will soon be available. Stay tuned!");
        programPoll.stop();
    };

    $scope.deleteProgramPoll = function(programPoll){
        alertService.showInfoMessageWithTimeout("Delete of program poll will soon be available. Stay tuned!");
    };

    init();

});