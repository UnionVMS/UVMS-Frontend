angular.module('unionvmsWeb').controller('ReportslistmodalCtrl',function($scope,$modalInstance,$timeout,reportService,reportsListLoaded,reportingNavigatorService){
    $scope.repServ = reportService;
    $scope.reportsListLoaded = reportsListLoaded;

    $scope.cancel = function () {
        reportingNavigatorService.rmStateParams();
        reportingNavigatorService.rmStateCallback();
        $modalInstance.dismiss('cancel');
    };
    
    $modalInstance.rendered.then(function(){
        $scope.repServ.loadReportList();
    });

    $scope.openReportForm = function(mode,report) {
        reportingNavigatorService.rmStateParams();
        $modalInstance.close({action: mode, report: report});
    };

});