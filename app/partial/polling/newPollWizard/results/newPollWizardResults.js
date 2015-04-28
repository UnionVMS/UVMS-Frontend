angular.module('unionvmsWeb').controller('NewpollwizardresultsCtrl',function($scope, Poll, PollStatus, alertService){

    //Search objects and results
    $scope.currentResult = {
        polls : [],
        sortBy : "",
        sortReverse : ""
    };   

    //Add dummy polls
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    var a = new Poll();
    a.status = [new PollStatus("Request failed")];
    $scope.currentResult.polls.push(a);
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());
    $scope.currentResult.polls.push(new Poll());    

    $scope.print = function(){
        console.log("Print...");
        window.print();        
    };

    $scope.exportAsFile = function(){
        alertService.showInfoMessageWithTimeout("Export as file will soon be available. Stay tuned!");
    };

});