angular.module('unionvmsWeb').controller('AlertsCtrl',function($scope, alertService){

    $scope.alert = alertService.getCurrentAlert();

});