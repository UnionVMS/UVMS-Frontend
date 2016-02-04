angular.module('unionvmsWeb').controller('SaveasmodalCtrl',function($scope,$modalInstance,reportData){
	$scope.report = reportData;
	$scope.report.nameCopy = $scope.report.name;
	$scope.report.descCopy = $scope.report.desc;
	
	$scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.report = undefined;
    };

    $scope.save = function () {
        if ($scope.saveAsForm.$invalid){
        	delete $scope.report.nameCopy;
        	delete $scope.report.descCopy;
            return false;
        } else {
        	$scope.report.copy = true;
        	$scope.report.name = $scope.report.nameCopy;
        	$scope.report.desc = $scope.report.descCopy;
        	delete $scope.report.nameCopy;
        	delete $scope.report.descCopy;
            $modalInstance.close(angular.copy($scope.report));
            $scope.report = undefined;
        }
    };
});