angular.module('unionvmsWeb').controller('AssignVesselCommentCtrl', function($scope, $modalInstance, vesselName) {

	$scope.comment = "";
	$scope.vesselName = vesselName;

	$scope.save = function() {
		$modalInstance.close($scope.comment);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
});
