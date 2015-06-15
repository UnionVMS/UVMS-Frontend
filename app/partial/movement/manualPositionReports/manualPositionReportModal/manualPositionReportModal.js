angular.module('unionvmsWeb').controller('ManualPositionReportModalCtrl', function($scope, $modalInstance, locale, movementRestService, vesselRestService, GetListRequest, $filter, position) {

    $scope.errorMessage ="";

    //The new manual position report
	$scope.flagState = "SWE";
	$scope.ircs = position.vessel.ircs;
	$scope.cfr = position.vessel.cfr;
	$scope.externalMarking = position.vessel.externalMarking;
	$scope.name = position.vessel.name;
	$scope.status = "010";
	$scope.dateTime = position.movement.time;
	$scope.latitude = position.movement.latitude;
	$scope.longitude = position.movement.longitude;
	$scope.measuredSpeed = position.movement.measuredSpeed;
	$scope.course = position.movement.course;

	$scope.measuredSpeedWarningThreshold = 15;
    $scope.maxDateTime = new Date().getTime();
    $scope.submitAttempted = false;

    $scope.center = {
        autoDiscover: true,
        zoom: 5
    };

    $scope.newPosition = {
        lat: $scope.latitude,
        lng: $scope.longitude,
        message: $filter('i18n')("movement.manual_position_label_new_position")
    };

    $scope.markers = {
        newPosition: $scope.newPosition
    };

    $scope.savePosition = function() {
        $scope.submitAttempted = true;
    };

    $scope.updateNewPositionVisibility = function() {
        var hasCoordinates = !isNaN($scope.longitude) && !isNaN($scope.latitude);
        if ($scope.markers.newPosition && !hasCoordinates) {
            $scope.markers = {};
        }
        else if (!$scope.markers.newPosition && hasCoordinates) {
            $scope.markers = { newPosition: $scope.newPosition };
        }
    };

    $scope.$watch('latitude', function(newLatitude) {
        $scope.newPosition.lat = parseFloat(newLatitude);
        $scope.updateNewPositionVisibility();
    });

    $scope.$watch('longitude', function(newLongitude) {
        $scope.newPosition.lng = parseFloat(newLongitude);
        $scope.updateNewPositionVisibility();
    });

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
		show: function(position) {
			$modal.open({
				templateUrl: 'partial/movement/manualPositionReports/manualPositionReportModal/manualPositionReportModal.html',
				controller: 'ManualPositionReportModalCtrl',
				size: 'md',
                resolve:{
                    position : function (){
                        return position || {};
                    }
                }
			});
		}
	};
});