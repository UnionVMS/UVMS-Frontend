angular.module('unionvmsWeb').controller('ReportspanelCtrl',function($scope){
    
    $scope.isVisible = {
            reportsList: true,
            reportForm: false
    };
    
    $scope.editMode = 'CREATE';
    
    $scope.toggleReportForm = function(mode){
        $scope.editMode = mode;
        $scope.isVisible.reportsList = !$scope.isVisible.reportsList;
        $scope.isVisible.reportForm = !$scope.isVisible.reportForm;
        
        //Call function from parent to toggle menu visibility
        $scope.toggleMenuVisibility();
        
        if ($scope.editMode === 'CREATE'){
            $scope.$broadcast('openReportForm');
        }
    };
});