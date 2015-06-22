angular.module('unionvmsWeb').controller('ManualPositionReportModalCtrl', function($scope, $modalInstance, locale, manualPositionRestService, vesselRestService, GetListRequest, $filter, position, ManualPosition, $timeout, movementRestService, leafletBoundsHelpers) {

    $scope.errorMessage ="";

    $scope.flagState = "SWE";
    $scope.ircs = position ? position.carrier.ircs : undefined;
    $scope.cfr = position ? position.carrier.cfr : undefined;
    $scope.externalMarking = position ? position.carrier.externalMarking : undefined;
    $scope.name = position ? position.carrier.name : undefined;
    $scope.status = "010";
    $scope.dateTime = position ? position.time : undefined;
    $scope.latitude = position ? position.position.latitude : undefined;
    $scope.longitude = position ? position.position.longitude : undefined;
    $scope.measuredSpeed = position ? position.speed : undefined;
    $scope.course = position ? position.course : undefined;
    $scope.guid = position ? position.guid : undefined;

    $scope.clearMovement = function() {
        $scope.ircs = undefined;
        $scope.cfr = undefined;
        $scope.externalMarking = undefined;
        $scope.name = undefined;
        $scope.dateTime = undefined;
        $scope.latitude = undefined;
        $scope.longitude = undefined;
        $scope.measuredSpeed = undefined;
        $scope.course = undefined;
    };

	$scope.measuredSpeedWarningThreshold = 15;
    $scope.maxDateTime = new Date().getTime();
    $scope.submitAttempted = false;
    $scope.confirmSend = false;
    $scope.sendSuccess = false;

    $scope.center = {
        lat: 0,
        lng: 0,
        zoom: 5
    };

    $scope.newPosition = {
        lat: $scope.latitude,
        lng: $scope.longitude,
        message: locale.getString("movement.manual_position_label_new_position"),
        focus: true
    };

    $scope.lastPosition = undefined;

    $scope.markers = {
        newPosition: $scope.newPosition
    };

    $scope.modalStatusClass = undefined;
    $scope.modalStatusText = undefined;

    $scope.init = function() {
        if ($scope.ircs && $scope.cfr) {
            $scope.initLastPosition($scope.ircs, $scope.cfr);
        }
    };

    $scope.initLastPosition = function(ircs, cfr) {
        var request = new GetListRequest(1, 1, true, []);
        request.addSearchCriteria("IRCS", ircs);
        request.addSearchCriteria("CFR", cfr);
        vesselRestService.getVesselList(request).then(function(page) {
            if (page.vessels.length > 0) {
                $scope.showLastMovementByVessel(page.vessels[0]);
            }
        });
    };

    $scope.closeModal = function() {
        var result = {
            addAnother: $scope.addAnother
        };

        if (result.addAnother) {
            result.ircs = $scope.ircs;
            result.cfr = $scope.cfr;
            result.externalMarking = $scope.externalMarking;
            result.name = $scope.name;
        }

        $modalInstance.close(result);
    };

    $scope.setSuccessText = function(text, action) {
        $scope.modalStatusText = text;
        $scope.modalStatusClass = "alert-success";

        if (action) {
            $timeout(action, 2000);
        }
    };

    $scope.setErrorText = function(text) {
        $scope.modalStatusText = text;
        $scope.modalStatusClass = "alert-danger";
    };

    $scope.createManualMovement = function() {
        var p = new ManualPosition();
        p.guid = $scope.guid;

        p.carrier.flagState = $scope.flagState;
        p.carrier.ircs = $scope.ircs;
        p.carrier.cfr = $scope.cfr;
        p.carrier.name = $scope.name;
        p.carrier.externalMarking = $scope.externalMarking;

        p.position.longitude = $scope.longitude;
        p.position.latitude = $scope.latitude;

        p.speed = $scope.measuredSpeed;
        p.course = $scope.course;
        p.time = moment($scope.dateTime).format("YYYY-MM-DD HH:mm:ss Z");
        p.status = $scope.status;

        return p;
    };

    $scope.savePosition = function() {
        var promise;
        var movement = $scope.createManualMovement();
        if (movement.guid) {
            promise = manualPositionRestService.updateManualMovement(movement);
        }
        else {
            promise = manualPositionRestService.createManualMovement(movement);
        }

        promise.then(function() {
            $scope.setSuccessText(locale.getString("movement.manual_position_save_success"), $scope.closeModal);
        }, function(errorMessage) {
            $scope.setErrorText(locale.getString("movement.manual_position_save_error"));
        });
    };

    $scope.sendPosition = function() {
        $scope.submitAttempted = true;
        if ($scope.confirmSend) {
            var movement = $scope.createManualMovement();
            manualPositionRestService.sendMovement(movement).then(function() {
                $scope.sendSuccess = true;
                $scope.setSuccessText(locale.getString("movement.manual_position_send_success"), $scope.closeModal);
            }, function() {
                $scope.sendSuccess = false;
                $scope.setErrorText(locale.getString("movement.manual_position_send_error"));
            });
        }
        else if ($scope.manualPositionReportForm.$valid) {
            $scope.confirmSend = true;
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

    $scope.back = function() {
        $scope.confirmSend = false;
    };

    $scope.getMarkerBounds = function() {
        var points = [$scope.markers.newPosition, $scope.markers.lastPosition].filter(function(position) {
            return position !== undefined;        // (1) Filter existing positions
        }).map(function(position) {
            return [position.lat, position.lng];  // (2) Convert to [lat,lng] list
        });

        if (points.length === 0) {
            points.push([0, 0]);                  // (3) Add [0,0] to empty list
        }

        if (points.length < 2) {
            points.push(points[0]);               // (4) Replicate single point (2 required)
        }

        return points;
    };

    $scope.updateNewPositionVisibility = function() {
        var hasCoordinates = !isNaN($scope.longitude) && !isNaN($scope.latitude);
        if ($scope.markers.newPosition && !hasCoordinates) {
            $scope.markers = {};
        }
        else if (!$scope.markers.newPosition && hasCoordinates) {
            $scope.markers = { newPosition: $scope.newPosition };
        }

        if ($scope.lastPosition) {
            $scope.markers.lastPosition = $scope.lastPosition;
        }
        else {
            delete $scope.markers.lastPosition;
        }

        $scope.bounds = leafletBoundsHelpers.createBoundsFromArray($scope.getMarkerBounds());
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

        $scope.showLastMovementByVessel(item);
    };

    $scope.setLastPosition = function(pos) {
        if (pos) {
            $scope.lastPosition = {
                lng: pos.longitude,
                lat: pos.latitude,
                message: locale.getString("movement.manual_position_label_previous_position", pos.time),
                focus: true
            };
        }
        else {
            $scope.lastPosition = undefined;
        }

        $scope.updateNewPositionVisibility();
    };

    $scope.showLastMovementByVessel = function(vessel) {
        if (vessel.vesselId === undefined || vessel.vesselId.type !== "GUID" || vessel.vesselId.value === undefined) {
            return;
        }

        movementRestService.getLastMovement(vessel.vesselId.value).then(function(pos) {
            $scope.setLastPosition(pos);
        });
    };

    $scope.init();
});

angular.module('unionvmsWeb').factory('ManualPositionReportModal', function($modal) {
	return {
		show: function(position) {
			return $modal.open({
				templateUrl: 'partial/movement/manualPositionReports/manualPositionReportModal/manualPositionReportModal.html',
				controller: 'ManualPositionReportModalCtrl',
				size: 'md',
                resolve:{
                    position : function (){
                        return position;
                    }
                }
			}).result;
		}
	};
});