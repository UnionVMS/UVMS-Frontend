angular.module('unionvmsWeb').controller('ReportslistmodalCtrl',function($scope,$modalInstance,$timeout,reportService,reportingNavigatorService){
    $scope.repServ = reportService;

    $scope.cancel = function () {
        reportingNavigatorService.rmStateParams();
        reportingNavigatorService.rmStateCallback();
        $modalInstance.dismiss('cancel');
    };
    
    $scope.close = function(){
        reportingNavigatorService.rmStateParams();
        reportingNavigatorService.rmStateCallback();
        $modalInstance.close();
    };
    
    $scope.openReportForm = function(mode,report) {
        reportingNavigatorService.rmStateParams();
        $modalInstance.close({action: mode, report: report});
    };

});