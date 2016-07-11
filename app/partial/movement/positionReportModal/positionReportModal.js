/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('PositionReportModalCtrl', function($scope, $log, $modalInstance, locale, movementRestService, vesselRestService, dateTimeService, positionReport, positionReportGuid, globalSettingsService, movementCsvService, leafletData, $timeout) {

    $scope.waitingForResponse = false;
    $scope.waitingForResponseMessage = locale.getString('movement.positions_modal_loading_text');
    $scope.positionReport = positionReport;
    $scope.bounds = {};
    $scope.center = {};
    $scope.markers = {};
    $scope.errorMessage = undefined;
    $scope.speedUnit = globalSettingsService.getSpeedUnit();

    /* Needed to invalidate map size after initial resize. */
    if ($modalInstance.rendered) {
        $modalInstance.rendered.then(function() {
            return leafletData.getMap().then(function(map) {
                $timeout(function() {
                    map.invalidateSize();
                }, 10);
            });
        });
    }

    $scope.exportCsv = function(movement) {
        movementCsvService.exportMovements([movement]);
    };

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
            size: 'lg',
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