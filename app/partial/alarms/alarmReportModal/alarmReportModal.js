/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('AlarmReportModalCtrl', function($scope, $log, $q, $timeout, $uibModalInstance, locale, alarm, options, GetListRequest, SearchResults, vesselRestService, dateTimeService, alarmRestService,  userService, configurationService, globalSettingsService, $filter, leafletData, alarmCsvService) {

    //Number of items displayed on each page
    $scope.itemsByPage = 5;

    $scope.alarm = alarm;
    $scope.knownVessel = angular.isDefined(alarm.vessel);
    $scope.options = options;
    $scope.readOnly = options.readOnly;
    $scope.waitingForStatusUpdateResponse = false;

    $scope.markers = {};
    $scope.center = {};

    //Status updated successfully
    $scope.statusUpdatedSuccessfully = false;

    $scope.loadingMovement = false;
    $scope.loadingMovementError = false;

    //Vessel search result
    $scope.currentSearchResults = new SearchResults('name', false, locale.getString('vessel.search_zero_results_error'));

    //Keep track of visibility statuses
    $scope.isVisible = {
        assignAsset : false
    };

    $scope.speedUnit = globalSettingsService.getSpeedUnit();

    /* Needed to invalidate map size after initial resize. */
    if ($uibModalInstance.rendered) {
        $uibModalInstance.rendered.then(function() {
            return leafletData.getMap().then(function(map) {
                $timeout(function() {
                    map.invalidateSize();
                }, 10);
            });
        });
    }

    function getAlarmWarningActions(ruleNames) {
        var actions = [];
        if (ruleNames.indexOf('Asset not found') >= 0 || ruleNames.indexOf('Terminal not found') >= 0) {
            actions.push(locale.getString('alarms.add_tranceiver_asset_reprocess'));
        }

        if (ruleNames.indexOf('Latitude missing') >= 0 || ruleNames.indexOf('Longitude missing') >= 0) {
            actions.push(locale.getString('alarms.report_not_added_to_database'));
        }

        return actions;
    }

    function getRuleNames(alarm) {
        return alarm.alarmItems.map(function(alarmItem) {
            return alarmItem.ruleName;
        });
    }

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    $scope.init = function() {
        // MobileTerminal -> DNID + MEMBER_NUMBER
        if (angular.isDefined(options.mobileTerminalPromise)) {
            $scope.showDnid = true;
            $scope.showMemberNumber = true;
            options.mobileTerminalPromise.then(function(mt) {
                for (var i = 0; i < mt.channels.length; i++) {
                    if (mt.channels[i].guid === $scope.alarm.channelGuid) {
                        $scope.channelDnid = mt.channels[i].ids.DNID;
                        $scope.channelMemberNumber = mt.channels[i].ids.MEMBER_NUMBER;
                        break;
                    }
                }
            });
        }
        else {
            $scope.showDnid = false;
            $scope.showMemberNumber = false;
        }

        //MovementPromise in options?
        if(angular.isDefined(options.movementPromise)){
            $scope.loadingMovement = true;
            options.movementPromise.then(function(movement){
                $scope.alarm.movement = movement;
                $scope.addMarkerToMap();
                $scope.loadingMovement = false;
            }, function(err){
                $scope.loadingMovementError = true;
                $scope.setErrorText(locale.getString('alarms.position_report_loading_movement_error'));
                $scope.loadingMovement = false;
                $log.error("Error getting movement for ticket.", err);
            });
        }
        //Already got movement
        else{
            $scope.addMarkerToMap();
        }

        var ruleNames = getRuleNames(alarm);
        var actions = getAlarmWarningActions(ruleNames);
        $scope.warningMessage = ruleNames.map(function(ruleName) {
            return ruleName + '.';
        }).concat(actions).join(' ');
    };

    $scope.closeModal = function() {
        $uibModalInstance.close();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };

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

    //Show/hide assign asset form
    $scope.toggleAssignAsset = function(){
        $scope.isVisible.assignAsset = !$scope.isVisible.assignAsset;
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

    //Reprocess the alarm
    $scope.reprocess = function(){
        $scope.waitingForStatusUpdateResponse = true;
        var copy = $scope.alarm.copy();

        alarmRestService.reprocessAlarms([alarm.guid]).then(function(){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.alarm.setStatusToReprocessed();
            $scope.statusUpdatedSuccessfully = true;
            $scope.setSuccessText(locale.getString("alarms.position_report_status_update_reprocess_success"), $scope.closeModal);
            $scope.callCallbackFunctionAfterStatusChange($scope.alarm);
        },
        function(error){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.setErrorText(locale.getString("alarms.position_report_status_update_reprocess_error"));
        });
    };

    //Reject the alarm
    $scope.reject = function(){
        $scope.waitingForStatusUpdateResponse = true;
        var copy = $scope.alarm.copy();
        copy.setStatusToRejected();
        alarmRestService.updateAlarmStatus(copy).then(function(updatedAlarm){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.alarm.status = updatedAlarm.status;
            $scope.statusUpdatedSuccessfully = true;
            $scope.setSuccessText(locale.getString("alarms.position_report_status_update_reject_success"), $scope.closeModal);
            $scope.callCallbackFunctionAfterStatusChange(updatedAlarm);
        },
        function(error){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.setErrorText(locale.getString("alarms.position_report_status_update_reject_error"));
        });
    };

    //Reopen the alarm
    $scope.reopen = function(){
        $scope.waitingForStatusUpdateResponse = true;
        var copy = $scope.alarm.copy();
        copy.setStatusToOpen();
        alarmRestService.updateAlarmStatus(copy).then(function(updatedAlarm){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.alarm.status = updatedAlarm.status;
            $scope.readOnly = false;
            $scope.setSuccessText(locale.getString("alarms.position_report_status_update_reopen_success"), function(){
                $scope.modalStatusText = '';
            });
            $scope.callCallbackFunctionAfterStatusChange(updatedAlarm);
        },
        function(error){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.setErrorText(locale.getString("alarms.position_report_status_update_reopen_error"));
        });
    };

    //Call callback function
    $scope.callCallbackFunctionAfterStatusChange = function(updatedAlarm){
        if(angular.isFunction(options.updateStatusCallback)) {
            options.updateStatusCallback(updatedAlarm);
        }
    };

    /*VESSEL SEARCH*/
    var getListRequest = new GetListRequest(1, 5, false, []);
    //Search objects and results
    //Dropdown values
    $scope.assignAssetSearchTypes = [
        {
            text: [locale.getString('vessel.ircs'), locale.getString('vessel.name'), locale.getString('vessel.cfr')].join('/'),
            code: 'ALL'
        },
        {
            text: locale.getString('vessel.ircs'),
            code: 'IRCS'
        },
        {
            text: locale.getString('vessel.name'),
            code: 'NAME'
        },
        {
            text: locale.getString('vessel.cfr'),
            code: 'CFR'
        }
    ];
    $scope.assignAssetSearchType = $scope.assignAssetSearchTypes[0].code;

    //Perform the serach
    $scope.searchVessel = function(){
        //Check that search input isn't empty
        if(typeof $scope.assignAssetSearchText !== 'string' || $scope.assignAssetSearchText.trim().length === 0){
            return;
        }

        //Create new request
        getListRequest = new GetListRequest(1, 10000000, false, []);
        $scope.currentSearchResults.setLoading(true);

        //Set search criterias
        //TODO: Search for national vessel only???
        var searchValue = $scope.assignAssetSearchText;
        if($scope.assignAssetSearchType === "ALL"){
            getListRequest.addSearchCriteria("NAME", searchValue);
            getListRequest.addSearchCriteria("CFR", searchValue);
            getListRequest.addSearchCriteria("IRCS", searchValue);
        }else{
            getListRequest.addSearchCriteria($scope.assignAssetSearchType, searchValue);
        }

        //Do the search
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Search success
    var onSearchVesselSuccess = function(vesselListPage){
        $scope.currentSearchResults.updateWithNewResults(vesselListPage);
        $scope.allCurrentSearchResults = vesselListPage.items;
        $scope.currentSearchResultsByPage = vesselListPage.items;
    };

    //Search error
    var onSearchVesselError = function(response){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        $scope.allCurrentSearchResults = $scope.currentSearchResults.items;
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            getListRequest.page = page;
            $scope.currentSearchResults.setLoading(true);
            vesselRestService.getVesselList(getListRequest)
                .then(onSearchVesselSuccess, onSearchVesselError);
        }
    };

    //Handle click event on add vessel button
    $scope.selectVessel = function(vessel){
        //Set the placeholder vessel
        $scope.alarm.placeholderVessel = vessel;
    };

    //Handle click event on added vessel button
    $scope.unselectVessel = function(vessel){
        //Remove placeholder vessel
        $scope.alarm.placeholderVessel = undefined;
    };

    $scope.toSpeedString = function(speedValue) {
        if (angular.isDefined(speedValue) && speedValue !== null) {
            return $filter('speed')(speedValue) + " " + locale.getString("common.speed_unit_" + $scope.speedUnit);
        }
    };

    $scope.toCourseString = function(courseValue) {
        if (angular.isDefined(courseValue) && courseValue !== null) {
            return courseValue + " " + locale.getString("movement.manual_position_field_unit_degrees");
        }
    };

    $scope.exportCsv = function(alarm) {
        alarmCsvService.exportAlarms([alarm]);
    };

    $scope.init();
});

angular.module('unionvmsWeb').factory('AlarmReportModal', function($uibModal) {
    return {
        show: function(alarm, options) {
            return $uibModal.open({
                templateUrl: 'partial/alarms/alarmReportModal/alarmReportModal.html',
                controller: 'AlarmReportModalCtrl',
                windowClass : "alarmReportModal",
                backdrop: 'static', //will not close when clicking outside the modal window
                size: 'lg',
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