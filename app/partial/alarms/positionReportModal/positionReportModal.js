angular.module('unionvmsWeb').controller('PositionReportModalCtrl', function($scope, $log, $modalInstance, locale, alarm, options, GetListRequest, SearchResults, vesselRestService, dateTimeService) {

    $scope.alarm = alarm;
    $scope.knownVessel = angular.isDefined(alarm.vessel);
    $scope.options = options;
    $scope.readOnly = options.readOnly;

    $scope.inactivePosition = false;

    $scope.markers = {};
    $scope.center = {};

    //Vessel search result
    $scope.currentSearchResults = new SearchResults('name', false, locale.getString('vessel.search_zero_results_error'));

    //Keep track of visibility statuses
    $scope.isVisible = {
        assignAsset : false
    };

    $scope.init = function() {
        $scope.addMarkerToMap();
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

    //Accept and poll alarm
    $scope.acceptAndPoll = function(){
        $log.info("TODO: Implement acceptAndPoll");
    };

    //Accept the alarm
    $scope.accept = function(){
        $log.info("TODO: Implement accept");
    };

    //Reject the alarm
    $scope.reject = function(){
        $log.info("TODO: Implement reject");
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

angular.module('unionvmsWeb').factory('PositionReportModal', function($modal) {
    return {
        show: function(alarm, options) {
            return $modal.open({
                templateUrl: 'partial/alarms/positionReportModal/positionReportModal.html',
                controller: 'PositionReportModalCtrl',
                windowClass : "positionReportModal",
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