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
angular.module('unionvmsWeb').controller('TicketModalCtrl', function($scope, $log, $q, $timeout, $modalInstance, locale, alarm, options, GetListRequest, SearchResults, vesselRestService, dateTimeService, alarmRestService,  userService, configurationService, globalSettingsService, $filter, $state) {

    $scope.alarm = alarm;
    $scope.options = options;
    $scope.markers = {};
    $scope.center = {};
    $scope.loadingMovement = false;
    $scope.loadingMovementError = false;
    $scope.speedUnit = globalSettingsService.getSpeedUnit();

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

    $scope.closeTicket = function(ticket) {
        ticket.setStatusToClosed();
        $modalInstance.close(ticket);
    };

    $scope.init = function() {
        if(angular.isDefined(options.movementPromise)){
            loadMovement(options.movementPromise);
        }
        else {
            //Already got movement
            $scope.addMarkerToMap();
        }
    };

    function loadMovement(movementPromise) {
        $scope.loadingMovement = true;
        movementPromise.then(function(movement) {
            $scope.alarm.movement = movement;
            $scope.addMarkerToMap();
            $scope.loadingMovement = false;
        }, function(err) {
            $scope.loadingMovementError = true;
            $scope.loadingMovementErrorText = locale.getString('alarms.position_report_loading_movement_error');
            $scope.loadingMovement = false;
            $log.error("Error getting movement for ticket.", err);
        });
    }

    //Add a marker to the map and center map on the marker
    $scope.addMarkerToMap = function(){
        if(angular.isDefined($scope.alarm.movement) && angular.isDefined($scope.alarm.movement.movement)){
            var lat = $scope.alarm.movement.movement.latitude;
            var lng = $scope.alarm.movement.movement.longitude;
            if(angular.isDefined(lat) && angular.isDefined(lng) && lat !== null && lng !== null){
                //Add marker
                var formattedTime =  dateTimeService.formatAccordingToUserSettings($scope.alarm.movement.time);
                var marker = {
                    lat: lat,
                    lng: lng,
                    message: formattedTime,
                    focus: true,
                };
                $scope.markers['reportedPosition'] = marker;

                //Center on the marker
                $scope.center.lat = lat;
                $scope.center.lng = lng;
                $scope.center.zoom = 10;
            }
        }
    };

    //Get status label
    $scope.getStatusLabel = function(status){
        switch(status){
            case 'OPEN':
                return locale.getString('alarms.alarms_status_open');
            case 'CLOSED':
                return locale.getString('alarms.alarms_status_closed');
            case 'REJECTED':
                return locale.getString('alarms.alarms_status_rejected');
            case 'REPROCESSED':
                return locale.getString('alarms.alarms_status_reprocessed');
            default:
                return status;
        }
    };

    //Get CSS class for the status label
    $scope.getStatusLabelClass = function(status){
        switch(status){
            case 'CLOSED':
                return "label-success";
            case 'OPEN':
                return "label-danger";
            default:
                return "label-warning";
        }
    };

    $scope.toSpeedString = function(speedValue) {
        if (angular.isDefined(speedValue) && speedValue !== null) {
            return $filter('speed')(speedValue) + " " + locale.getString("common.speed_unit_" + $scope.speedUnit);
        }
    };

    $scope.toCourseString = function(courseValue) {
        if (angular.isDefined(courseValue) && courseValue !== null) {
            return courseValue + locale.getString("movement.manual_position_field_unit_degrees");
        }
    };

    $scope.goToPoll = function(ticket) {
        $state.go('app.polling', {
            cfr: ticket.vessel.cfr,
            externalMarking: ticket.vessel.externalMarking,
            ircs: ticket.vessel.ircs,
            name: ticket.vessel.name
        });
    };

    $scope.init();
});

angular.module('unionvmsWeb').factory('TicketModal', function($modal) {
    return {
        show: function(alarm, options) {
            return $modal.open({
                templateUrl: 'partial/alarms/openTickets/ticketModal.html',
                controller: 'TicketModalCtrl',
                windowClass : "alarmReportModal",
                backdrop: 'static', //will not close when clicking outside the modal window
                size: 'md',
                resolve:{
                    alarm : function (){
                        return alarm;
                    },
                    options : function (){
                        return options;
                    },
                }
            });
        }
    };
});