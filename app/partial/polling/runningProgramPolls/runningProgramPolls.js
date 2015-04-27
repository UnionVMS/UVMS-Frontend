angular.module('unionvmsWeb').controller('RunningProgramPollsCtrl',function($scope, ProgramPoll){


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
        //Load list with program polls
        //$scope.searchMobileTerminals();

        //Add 3 dummy polls
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());
        $scope.currentSearchResults.programPolls.push(new ProgramPoll());

    };

    init();

});