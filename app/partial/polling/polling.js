angular.module('unionvmsWeb').controller('PollingCtrl',function($scope, alertService, searchService){

    $scope.activeTab = "POLLING";

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });
});