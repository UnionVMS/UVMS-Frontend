angular.module('unionvmsWeb').controller('ManualPositionReportModalCtrl', function($scope, $location,$modalInstance, locale, manualPositionRestService, vesselRestService, GetListRequest, $filter, positionReport, ManualPosition, $timeout, movementRestService, coordinateFormatService, dateTimeService, vesselValidationService, leafletBoundsHelpers, addAnother, reloadFunction, readOnly, manualPositionSource) {

    $scope.errorMessage ="";
    $scope.readOnly = readOnly;
    $scope.manualPositionSource = manualPositionSource;
    $scope.positionReport = positionReport;

    //Set status
    $scope.positionReport.status = "010";

    //CUSTOM VALIDATIONS
    $scope.cfrRegExp = vesselValidationService.getCFRPattern();
    $scope.cfrValidationMessages = {
        'pattern' : locale.getString('vessel.vessel_details_cfr_pattern_validation_message')
    };
    $scope.maxTwoDecimalsRegExp = vesselValidationService.getMaxTwoDecimalsPattern();
    $scope.maxTwoDecimalsValidationMessages = {
        'pattern' : locale.getString('common.validation_max_number_of_decimals', "2")
    };

    $scope.clearMovement = function() {
        var oldGuid = positionReport.guid;
        $scope.positionReport = new ManualPosition();
        $scope.guid = oldGuid;
        $scope.positionReport.status = "010";
    };

    //Max speed - warning is shown is speed is higher
	$scope.measuredSpeedWarningThreshold = 15;
    $scope.maxDateTime = dateTimeService.formatUTCDateWithTimezone(moment.utc());
    $scope.submitAttempted = false;
    $scope.confirmSend = false;
    $scope.sendSuccess = false;
    $scope.addAnother = addAnother;
    $scope.waitingForResponse = false;

    //MARKERS
    $scope.markers = {};

    $scope.newPosition = {
        lat: $scope.positionReport.position.latitude,
        lng: $scope.positionReport.position.longitude,
        message: locale.getString("movement.manual_position_label_new_position"),
        focus: true
    };
    $scope.lastPosition = undefined;


    $scope.modalStatusClass = undefined;
    $scope.modalStatusText = undefined;

    $scope.init = function() {
        $scope.resetMap();

        //Show last position
        if ($scope.positionReport.carrier.ircs && $scope.positionReport.carrier.cfr) {
            $scope.initLastPosition($scope.positionReport.carrier.ircs, $scope.positionReport.carrier.cfr);
        }

        //Center on newpos if available
        if($scope.newPosition.lat && $scope.newPosition.lng){
            $scope.center.lat = $scope.newPosition.lat;
            $scope.center.lng = $scope.newPosition.lng;
            $scope.center.zoom = 10;
        }
    };

    //Reset map to start position
    //TODO:Get values from config
    $scope.resetMap = function(){
        $scope.center = {
            lat: 57.2,
            lng: 14.2,
            zoom: 5
        };
    };

    //Get last position for the vessel
    $scope.initLastPosition = function(ircs, cfr) {
        var request = new GetListRequest(1, 1, true, []);
        request.addSearchCriteria("IRCS", ircs);
        request.addSearchCriteria("CFR", cfr);
        vesselRestService.getVesselList(request).then(function(page) {
            if(angular.isDefined(page.items) && page.items.length > 0) {
                $scope.showLastMovementByVessel(page.items[0]);
            }
        });
    };

    $scope.modalTitle = function() {
        if ($scope.readOnly) {
            return "movement.position_report_header";
        }
        else if ($scope.sendSuccess) {
            return "movement.manual_position_header_sent";
        }
        else if ($scope.confirmSend) {
            return "movement.manual_position_header_confirm";
        }
        else {
            return "movement.manual_position_header_new";
        }
    };

    $scope.closeModal = function() {
        var result = {
            addAnother: $scope.addAnother
        };

        if (result.addAnother) {
            result.ircs = $scope.positionReport.carrier.ircs;
            result.cfr = $scope.positionReport.carrier.cfr;
            result.externalMarking = $scope.positionReport.carrier.externalMarking;
            result.name = $scope.positionReport.carrier.name;
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

    //Save the position
    $scope.savePosition = function() {
        if(!$scope.waitingForResponse){
            var promise;
            //Update?
            if ($scope.positionReport.guid) {
                promise = manualPositionRestService.updateManualMovement($scope.positionReport);
            }
            else {
                promise = manualPositionRestService.createManualMovement($scope.positionReport);
            }

            //Handle result
            $scope.waitingForResponse = true;
            promise.then(function() {
                if (angular.isFunction(reloadFunction)) {
                    reloadFunction();
                }
                $scope.waitingForResponse = false;

                $scope.setSuccessText(locale.getString("movement.manual_position_save_success"), $scope.closeModal);

                if($scope.manualPositionSource){
                     $location.path('movement/manual');
                }

            }, function(errorMessage) {
                $scope.waitingForResponse = false;
                $scope.setErrorText(locale.getString("movement.manual_position_save_error"));
            });
        }
    };

    //Send position
    $scope.sendPosition = function() {
        $scope.submitAttempted = true;
        if ($scope.confirmSend) {
            $scope.waitingForResponse = true;
            manualPositionRestService.saveAndSendMovement($scope.positionReport).then(function() {
                if (angular.isFunction(reloadFunction)) {
                    reloadFunction();
                }
                $scope.waitingForResponse = false;
                $scope.sendSuccess = true;
                $scope.setSuccessText(locale.getString("movement.manual_position_send_success"), $scope.closeModal);
            }, function(err) {
                console.error("Error sending position report.");
                $scope.waitingForResponse = false;
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

        return points;
    };

    $scope.updateNewPositionVisibility = function() {
        var validCoordinatesForNewPosition = coordinateFormatService.isValidLatitude($scope.positionReport.position.latitude) && coordinateFormatService.isValidLongitude($scope.positionReport.position.longitude);
        //Marker for new position
        if ($scope.markers.newPosition && !validCoordinatesForNewPosition) {
            $scope.markers = {};
        }
        else if (!$scope.markers.newPosition && validCoordinatesForNewPosition) {
            $scope.markers = { newPosition: $scope.newPosition };
        }

        //Marker for last position
        if ($scope.lastPosition) {
            $scope.markers.lastPosition = $scope.lastPosition;
        }
        else {
            delete $scope.markers.lastPosition;
        }

        //Fit map to markers
        var numberOfMarkers = Object.keys($scope.markers).length;
        if(numberOfMarkers === 1){
            var tmpMarker = _.values($scope.markers)[0];
            $scope.center = {
                lat: tmpMarker.lat,
                lng: tmpMarker.lng,
                zoom: 5
            };
        }
        else if(numberOfMarkers > 1){
            var bounds = $scope.getMarkerBounds();
            $scope.bounds = leafletBoundsHelpers.createBoundsFromArray(bounds);
        }
        else{
            $scope.resetMap();
        }
    };

    $scope.$watch('positionReport.position.latitude', function(newLatitude) {
        $scope.newPosition.lat = parseFloat(newLatitude);
        $scope.updateNewPositionVisibility();
    });

    $scope.$watch('positionReport.position.longitude', function(newLongitude) {
        $scope.newPosition.lng = parseFloat(newLongitude);
        $scope.updateNewPositionVisibility();
    });


	$scope.isHighSpeed = function() {
		return $scope.positionReport.speed > $scope.measuredSpeedWarningThreshold;
	};

	$scope.dismiss = function() {
		$modalInstance.dismiss();
	};

    //Auto suggestions search
    var vesselsGetListRequest = new GetListRequest(1, 20, true, []);

    //Get vessels matching search query
    var getVessels = function() {
        $scope.errorMessage = "";
        return vesselRestService.getVesselList(vesselsGetListRequest).then(
            function(vesselListPage){
                return vesselListPage.items;
            },
            function(error){
                $scope.errorMessage = locale.getString("movement.manual_position_button_search_error");
                return [];
            }
        );
    };

    $scope.getVesselsByIrcs = function(value){
        vesselsGetListRequest.resetCriterias();
        vesselsGetListRequest.addSearchCriteria("IRCS", value);
        return getVessels();
    };

    $scope.getVesselsByCFR = function(value){
        vesselsGetListRequest.resetCriterias();
        vesselsGetListRequest.addSearchCriteria("CFR", value);
        return getVessels();
    };
    //On select item in search suggestions
    $scope.onVesselSuggestionSelect = function(item, model, label){
        //Update values based on selection
        $scope.positionReport.carrier.ircs = item.ircs;
        $scope.positionReport.carrier.name = item.name;
        $scope.positionReport.carrier.externalMarking = item.externalMarking;
        $scope.positionReport.carrier.cfr = item.cfr;
        $scope.positionReport.carrier.flagState = item.countryCode;

        $scope.showLastMovementByVessel(item);
    };

    //Create a green marker icon for lastPosition
    var greenMarkerImage_base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAMAAAD3TXL8AAABKVBMVEUAAABQr2BYr1hVqlpVqllUq1xWrFlWrFtVqlpUq1tWq1pXrFtWq1tXq1tWrFtXrFxWq1xXq1xWq1tesWNVqlpVq1pYrFxarl5ltmlWqltWq1thtWZVq1tWrFxYrV1htGZbr2BarV1fs2RVq1xWq1xktWlXq1xZrl5arV9arl9brmBcr2FdsGJjs2dltWplt2lmtmtntmxnuGxouGxqu21rvG9svHBtvXJuvnNvv3Vwv3ZxuXVxwXZywXdzwnh0xHp1xHp1xHt2xHt3xXx5x356x397vn98yYN9yYSRyZSq1ayr1a202re12rfK5cvU6tb0+vVWq1tvxHRwxHVxxXZyxXd0xnh1xnp2x3t3x3x4x315yH56yH98yYB9yYF+yoJ/yoOAy4T///+z/1++AAAAUXRSTlMAECAwP0BQX2BwgKW0ucfL2Nvn7/Pz8/Pz9PT09fX19fb39/j4+Pn+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7rBU46AAABrElEQVR42nXRf1/SUBQG8MP40VDbEiwzEJNillBauWwlLaM1QkrOroBj7uf7fxFyxpV94H56/mL34Xs4u0CWfOFRoQBCilsvnlWr1QY+Lq6cS4p21osjP4p/6Q0lnxXyvm77E+bMM/EiHeVloZnB2HnITfBT41Xpdc9jThbm9bQSFbm97t3iaDzm8q5bz82bzVaYCjeyfliRy0iFrU0ACa0pPQSXp9jGd98DqqYWSlCuhYsBOBglyfDY8OkxrJVBNWa0kP32X0K5Rot+bGaogL300/m3ZJE/nzxa5vIpYEyN/3HAm+EHn5oYAftpc7LW9BF2zEk67ffKtKm5Awrf4M1yg/SbX1QoHwTp1l/xapSM/rb51gdlkNC+Sd/UfI8d7NCb0ohXEsCT+Tiq5rdj8ttxPEOl/+BlxNZulEW7Mt113Zw6q3HNOlA2nofLM06aG1QQul0nOVigZsREwpErkAwJRESziwpQBMTiQxkgS6X7gDyDSBb5MGYC4cjwMiKgjAiIyDasp0SI2VoRhCifPcfXFRBT1GyXEwHpMScisjgR0REnIsI8/Ccrs+4B7pi2A6D/GpkAAAAASUVORK5CYII=';
    var shadowImage_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAC5ElEQVRYw+2YW4/TMBCF45S0S1luXZCABy5CgLQgwf//S4BYBLTdJLax0fFqmB07nnQfEGqkIydpVH85M+NLjPe++dcPc4Q8Qh4hj5D/AaQJx6H/4TMwB0PeBNwU7EGQAmAtsNfAzoZkgIa0ZgLMa4Aj6CxIAsjhjOCoL5z7Glg1JAOkaicgvQBXuncwJAWjksLtBTWZe04CnYRktUGdilALppZBOgHGZcBzL6OClABvMSVIzyBjazOgrvACf1ydC5mguqAVg6RhdkSWQFj2uxfaq/BrIZOLEWgZdALIDvcMcZLD8ZbLC9de4yR1sYMi4G20S4Q/PWeJYxTOZn5zJXANZHIxAd4JWhPIloTJZhzMQduM89WQ3MUVAE/RnhAXpTycqys3NZALOBbB7kFrgLesQl2h45Fcj8L1tTSohUwuxhy8H/Qg6K7gIs+3kkaigQCOcyEXCHN07wyQazhrmIulvKMQAwMcmLNqyCVyMAI+BuxSMeTk3OPikLY2J1uE+VHQk6ANrhds+tNARqBeaGc72cK550FP4WhXmFmcMGhTwAR1ifOe3EvPqIegFmF+C8gVy0OfAaWQPMR7gF1OQKqGoBjq90HPMP01BUjPOqGFksC4emE48tWQAH0YmvOgF3DST6xieJgHAWxPAHMuNhrImIdvoNOKNWIOcE+UXE0pYAnkX6uhWsgVXDxHdTfCmrEEmMB2zMFimLVOtiiajxiGWrbU52EeCdyOwPEQD8LqyPH9Ti2kgYMf4OhSKB7qYILbBv3CuVTJ11Y80oaseiMWOONc/Y7kJYe0xL2f0BaiFTxknHO5HaMGMublKwxFGzYdWsBF174H/QDknhTHmHHN39iWFnkZx8lPyM8WHfYELmlLKtgWNmFNzQcC1b47gJ4hL19i7o65dhH0Negbca8vONZoP7doIeOC9zXm8RjuL0Gf4d4OYaU5ljo3GYiqzrWQHfJxA6ALhDpVKv9qYeZA8eM3EhfPSCmpuD0AAAAASUVORK5CYII=";

    var greenIcon = {
        iconUrl: greenMarkerImage_base64,
        shadowUrl: shadowImage_base64,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    };

    $scope.setLastPosition = function(movement) {
        if (movement) {
            var formattedTime =  dateTimeService.formatAccordingToUserSettings(movement.time);
            $scope.lastPosition = {
                lng: movement.movement.longitude,
                lat: movement.movement.latitude,
                message: locale.getString("movement.manual_position_label_previous_position", formattedTime),
                focus: true,
                icon: greenIcon
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

        movementRestService.getLastMovement(vessel.vesselId.value).then(function(movement) {
            $scope.setLastPosition(movement);
        }, function(error){
            console.log("Error getting last position for the vessel.");
        });
    };

    $scope.init();
});

angular.module('unionvmsWeb').factory('ManualPositionReportModal', function($modal) {
	return {
		show: function(positionReport, options) {
			return $modal.open({
				templateUrl: 'partial/movement/manualPositionReports/manualPositionReportModal/manualPositionReportModal.html',
                controller: 'ManualPositionReportModalCtrl',
				backdrop: 'static', //will not close when clicking outside the modal window
				size: 'md',
                resolve:{
                    positionReport : function (){
                        return positionReport;
                    },
                    addAnother: function() {
                        return options.addAnother || false;
                    },
                    reloadFunction: function() {
                        return options.reloadFunction;
                    },
                    readOnly: function() {
                        return !!options.readOnly;
                    },
                    manualPositionSource: function(){
                        return options.manualPositionSource || false;
                    }
                }
			});
		}
	};
});