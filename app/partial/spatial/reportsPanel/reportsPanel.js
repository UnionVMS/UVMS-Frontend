angular.module('unionvmsWeb').controller('ReportspanelCtrl',function($scope, $anchorScroll){
    
    $scope.isVisible = {
            reportsList: true,
            reportForm: false
    };
    
    $scope.editMode = 'CREATE';
    
    $scope.toggleReportForm = function(mode, report){
        $scope.editMode = mode;
        $scope.isVisible.reportsList = !$scope.isVisible.reportsList;
        $scope.isVisible.reportForm = !$scope.isVisible.reportForm;
        $anchorScroll();
        
        //Call function from parent to toggle menu visibility
        $scope.toggleMenuVisibility();
        
        if ($scope.editMode === 'CREATE'){
            $scope.$broadcast('openReportForm');
        } else if ($scope.editMode === 'EDIT') {
            $scope.$broadcast('openReportForm', {report: report});
        }
    };
    
    $scope.reloadReportsList = function(){
        $scope.$broadcast('loadReportsList');
    };
    
    $scope.$on('reloadReportsList', function(){
        $scope.reloadReportsList();
    });
});