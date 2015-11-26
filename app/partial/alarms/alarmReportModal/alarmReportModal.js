angular.module('unionvmsWeb').controller('AlarmReportModalCtrl', function($scope, $log, $q, $timeout, $modalInstance, locale, alarm, options, GetListRequest, SearchResults, vesselRestService, dateTimeService, alarmRestService, pollingService, pollingRestService, GetPollableListRequest) {

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

    $scope.init = function() {
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
    };

    $scope.closeModal = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };

    //Add a marker to the map and center map on the marker
    $scope.addMarkerToMap = function(){
        if(angular.isDefined($scope.alarm.movement) && angular.isDefined($scope.alarm.movement.movement)){
            var lat = $scope.alarm.movement.movement.latitude;
            var lng = $scope.alarm.movement.movement.longitude;
            if(angular.isDefined(lat) && angular.isDefined(lng)){
                var formattedTime =  dateTimeService.formatAccordingToUserSettings($scope.alarm.movement.time);
                var marker = {
                    lng: lat,
                    lat: lng,
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

    //Is acceptAndPoll allowed?
    $scope.acceptAndPollIsAllowed = function() {
        //TODO: Verify that user has access to polling
        //Only allowed for national vessels
        if(angular.isDefined($scope.alarm.vessel)){
            //TODO: Get flagstate from config
            var nationalFlagState = 'SWE';
            return $scope.alarm.vessel.countryCode === nationalFlagState;
        }
        return false;
    };


    //Get status label
    $scope.getStatusLabel = function(alarm){
        var label;
        switch(status){
            case alarm.isClosed():
                label = locale.getString('common.status_closed');
                break;
            case alarm.isPending():
                label = locale.getString('common.status_pending');
                break;
            case alarm.isOpen():
                label = locale.getString('common.status_open');
                break;
            default:
                label = alarm.status;
        }
        return label;
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

    //Update status in backend
    var sendStatusUpdateToServer = function(){
        alarmRestService.updateAlarmStatus($scope.alarm).then(function(){
            $scope.setSuccessText(locale.getString("movement.manual_position_save_success"), $scope.closeModal);
        },
        function(error){
            $scope.setErrorText(locale.getString("movement.manual_position_save_error"));
        });
    };

    //Accept and poll alarm
    $scope.acceptAndPoll = function(){
        if(!$scope.waitingForStatusUpdateResponse){
            $scope.waitingForStatusUpdateResponse = true;
            $scope.createPollForConnectId().then(function(){
                $scope.accept(true);
            }, function(err){
                $scope.waitingForStatusUpdateResponse = false;
                console.error(err);
                $scope.setErrorText(locale.getString("alarms.position_report_create_poll_error"));
            });
        }
    };

    //Create a poll for the selected alarm
    $scope.createPollForConnectId = function(){
        //Create a GetPollabeListRequest to get the pollable channels
        var getPollableListRequest = new GetPollableListRequest();
        var connectId = $scope.alarm.movement.connectId;
        getPollableListRequest.addConnectId(connectId);
        var deferred = $q.defer();
        pollingRestService.getPollablesMobileTerminal(getPollableListRequest).then(
            function(searchResultListPage){
                if(searchResultListPage.getNumberOfItems() === 0){
                    return deferred.reject("No pollable channel found.");
                }else if(searchResultListPage.getNumberOfItems() > 1){
                    return deferred.reject("More than one pollable channel found.");
                }else{
                    //Add termina to polling selection
                    pollingService.addMobileTerminalToSelection(searchResultListPage.items[0]);
                    pollingService.getPollingOptions().type = 'MANUAL';
                    pollingService.getPollingOptions().comment = locale.getString('alarms.position_report_create_poll_comment');
                    pollingService.createPolls().then(function(){
                        //Poll created
                        deferred.resolve("Poll created");
                    }, function(err){
                        deferred.reject("Error creating poll.", err);
                    });
                }
            },
            function(error){
                deferred.reject("Error getting pollable channels.");
            }
        );
        return deferred.promise;
    };
    //Accept the alarm
    $scope.accept = function(pollCreated){
        $scope.waitingForStatusUpdateResponse = true;
        var copy = $scope.alarm.copy();
        copy.setStatusToClosed();
        alarmRestService.updateAlarmStatus(copy).then(function(updatedAlarm){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.alarm.status = updatedAlarm.status;
            $scope.statusUpdatedSuccessfully = true;
            if(pollCreated){
                $scope.setSuccessText(locale.getString("alarms.position_report_status_update_poll_accept_success"), $scope.closeModal);
            }else{
                $scope.setSuccessText(locale.getString("alarms.position_report_status_update_accept_success"), $scope.closeModal);
            }
            $scope.callCallbackFunctionAfterStatusChange(updatedAlarm);
        },
        function(error){
            $scope.waitingForStatusUpdateResponse = false;
            $scope.setErrorText(locale.getString("alarms.position_report_status_update_accept_error"));
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
        console.log("searchVessel!");
        //Check that search input isn't empty
        if(typeof $scope.assignAssetSearchText !== 'string' || $scope.assignAssetSearchText.trim().length === 0){
            return;
        }

        //Create new request
        getListRequest = new GetListRequest(1, 5, false, []);
        $scope.currentSearchResults.setLoading(true);

        //Set search criterias
        //TODO: Search for national vessel only???
        var searchValue = $scope.assignAssetSearchText +"*";
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
    };

    //Search error
    var onSearchVesselError = function(response){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
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


    $scope.init();
});

angular.module('unionvmsWeb').factory('AlarmReportModal', function($modal) {
    return {
        show: function(alarm, options) {
            return $modal.open({
                templateUrl: 'partial/alarms/alarmReportModal/alarmReportModal.html',
                controller: 'AlarmReportModalCtrl',
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
            }).result;
        }
    };
});