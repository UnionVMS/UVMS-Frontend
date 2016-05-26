angular.module('unionvmsWeb').controller('AreagroupeditormodalCtrl',function($scope,$modalInstance,areaGroupName,areaAlertService){
	$scope.areaAlert = areaAlertService;
	$scope.areaGroupName = areaGroupName;
	
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.save = function() {
		$scope.isSubmitted = true;
		if($scope.areaGroupActiveForm.$valid){
			$scope.isSaving = true;
		}
		
	};
    
});