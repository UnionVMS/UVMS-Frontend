angular.module('unionvmsWeb').controller('ManualPositionReportModalCtrl', function($scope, $modalInstance, locale, movementRestService, vesselRestService, GetListRequest) {

    $scope.errorMessage ="";

    //The new manual position report
	$scope.flagState = "SWE";
	$scope.ircs = "SKRSM";
	$scope.cfr = "SWE0001234";
	$scope.externalMarking = "VG40";
	$scope.name = "Nordvåg";
	$scope.status = "010";
	$scope.dateTime = "2015-06-11 15:45:00";
	$scope.latitude = "57° 35,32' N";
	$scope.longitude = "11° 58,01' N";
	$scope.measuredSpeed = 8;
	$scope.course = 93;

	$scope.measuredSpeedWarningThreshold = 15;
    $scope.maxDateTime = new Date().getTime();

	$scope.center = {
		autoDiscover: true,
		zoom: 11
	};

	$scope.isHighSpeed = function() {
		return $scope.measuredSpeed > $scope.measuredSpeedWarningThreshold;
	};

	$scope.dismiss = function() {
		$modalInstance.dismiss();
	};

    //Auto suggestions search
    var vesselsGetListRequest = new GetListRequest(1, 20, true, []);

    //Get vessels matching search query
    var getVessels = function() {
        $scope.errorMessage = "";
        //Add FLAG_STATE search criteria
        //TODO: Get flag state from configuration
        vesselsGetListRequest.addSearchCriteria("FLAG_STATE", "SWE");
        return vesselRestService.getVesselList(vesselsGetListRequest).then(
            function(vesselListPage){
                return vesselListPage.vessels;
            },
            function(error){
                $scope.errorMessage = locale.getString("movement.manual_position_button_search_error");
                return [];
            }
        );
    };

    $scope.getVesselsByIrcs = function(value){
        vesselsGetListRequest.resetCriterias();
        vesselsGetListRequest.addSearchCriteria("IRCS", value +"*");
        return getVessels();
    };

    $scope.getVesselsByCFR = function(value){
        vesselsGetListRequest.resetCriterias();
        vesselsGetListRequest.addSearchCriteria("CFR", value +"*");
        return getVessels();
    };
    //On select item in search suggestions
    $scope.onVesselSuggestionSelect = function(item, model, label){
        //Update values based on selection
        $scope.ircs = item.ircs;
        $scope.name = item.name;
        $scope.externalMarking = item.externalMarking;
        $scope.cfr = item.cfr;
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