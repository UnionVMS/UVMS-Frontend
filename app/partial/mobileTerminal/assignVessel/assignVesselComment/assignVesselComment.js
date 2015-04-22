angular.module('unionvmsWeb').controller('AssignVesselCommentCtrl', function($scope, $modalInstance, title) {

	$scope.comment = "";
	$scope.title = title;

	$scope.save = function() {
		$modalInstance.close($scope.comment);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
});
