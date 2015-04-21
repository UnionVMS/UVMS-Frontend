angular.module('unionvmsWeb').controller('AlertsCtrl',function($scope, alertService){

    $scope.alert = alertService.getCurrentAlert();

    //Close alert
    $scope.closeAlert = function(){
        alertService.hideMessage();
    };

});