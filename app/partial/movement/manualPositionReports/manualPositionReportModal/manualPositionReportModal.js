angular.module('unionvmsWeb').controller('ManualPositionReportModalCtrl', function($scope, $modalInstance, movementRestService) {

	$scope.flagState = "SWE";
	$scope.ircs = "SKRM";
	$scope.cfr = "SWE0001234";
	$scope.externalMarking = "VG40";
	$scope.name = "Nordvåg";
	$scope.status = "010";
	$scope.dateTime = "2015-06-11 15:45:00";
	$scope.latitude = "57° 35,32' N";
	$scope.longitude = "11° 58,01' N";
	$scope.measuredSpeed = "8";
	$scope.course = "93";

	$scope.center = {
		autoDiscover: true,
		zoom: 11
	};

	$scope.dismiss = function() {
		$modalInstance.dismiss();
	};

});

angular.module('unionvmsWeb').factory('ManualPositionReportModal', function($modal) {
	return {
		show: function() {
			$modal.open({
				templateUrl: 'partial/movement/manualPositionReports/manualPositionReportModal/manualPositionReportModal.html',
				controller: 'ManualPositionReportModalCtrl',
				size: 'md'
			});
		}
	};
});