angular.module('unionvmsWeb').controller('NewpollwizardresultsCtrl',function($scope, alertService, pollingService){

    //Search objects and results
    $scope.currentResult = pollingService.getResult();

    $scope.print = function(){
        console.log("Print...");
        window.print();
    };

    $scope.exportAsFile = function(){
        alertService.showInfoMessageWithTimeout("Export as file will soon be available. Stay tuned!");
    };

});