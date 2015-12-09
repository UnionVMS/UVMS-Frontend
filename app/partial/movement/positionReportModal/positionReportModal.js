angular.module('unionvmsWeb').controller('PositionReportModalCtrl', function($scope, $log, $modalInstance, locale, movementRestService, vesselRestService, dateTimeService, positionReport, positionReportGuid, globalSettingsService) {

    $scope.waitingForResponse = false;
    $scope.waitingForResponseMessage = locale.getString('movement.positions_modal_loading_text');
    $scope.positionReport = positionReport;
    $scope.bounds = {};
    $scope.center = {};
    $scope.markers = {};
    $scope.errorMessage = undefined;
    $scope.speedUnit = globalSettingsService.getSpeedUnit();

    //Create the marker
    var createMarker = function(){
        if(angular.isDefined($scope.positionReport.movement.latitude) && angular.isDefined($scope.positionReport.movement.longitude)){
            $scope.markers.reportPosition = {
                lat: $scope.positionReport.movement.latitude,
                lng: $scope.positionReport.movement.longitude,
                message: dateTimeService.formatAccordingToUserSettings($scope.positionReport.time),
                focus: true
            };

            //Set map center to marker
            $scope.center = {
                lat: $scope.markers.reportPosition.lat,
                lng: $scope.markers.reportPosition.lng,
                zoom: 5
            };
        }else{
            $scope.errorMessage = locale.getString('movement.positions_modal_latlng_missing');
        }
    };

    $scope.init = function() {
        //Get position report
        if(angular.isDefined(positionReportGuid)){
            $scope.waitingForResponse = true;
            //Get the movement
            movementRestService.getMovement(positionReportGuid).then(function(movement) {
                $scope.positionReport = movement;
                createMarker();
                //Get vessel
                if(angular.isDefined($scope.positionReport.connectId)){
                    vesselRestService.getVessel($scope.positionReport.connectId).then(function(vessel) {
                        $scope.positionReport.vessel = vessel;
                        $scope.waitingForResponse = false;
                    }, function(err){
                        $scope.errorMessage = locale.getString('movement.positions_modal_loading_vessel_error');
                        $scope.waitingForResponse = false;
                    });
                }else{
                    //Show anyway
                    $scope.errorMessage = locale.getString('movement.positions_modal_connectid_missing_error');
                    $scope.waitingForResponse = false;
                }
            }, function(err){
                $scope.errorMessage = locale.getString('movement.positions_modal_loading_movement_error');
                $scope.waitingForResponse = false;
            });
        }
        //Aready got the movement
        else{
            createMarker();
        }
    };


    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

    $scope.init();
});

angular.module('unionvmsWeb').factory('PositionReportModal', function($modal) {

    var show = function(positionReport, positionReportGuid){
        return $modal.open({
            templateUrl: 'partial/movement/positionReportModal/positionReportModal.html',
            controller: 'PositionReportModalCtrl',
            size: 'md',
            resolve:{
                positionReport : function (){
                    return positionReport;
                },
                positionReportGuid : function (){
                    return positionReportGuid;
                }
            }
        });
    };

    //Show position report with guid
    var showReportWithGuid = function(guid){
        return show(undefined, guid);
    };

    //Show the provided position report
    var showReport = function(positionReport){
        return show(positionReport);
    };

    return {
        showReportWithGuid : showReportWithGuid,
        showReport : showReport
    };
});