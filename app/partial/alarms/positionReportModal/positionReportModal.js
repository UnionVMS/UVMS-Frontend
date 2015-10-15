angular.module('unionvmsWeb').controller('PositionReportModalCtrl', function($scope, $log, $modalInstance, locale, position, options, GetListRequest, SearchResults, vesselRestService) {

    //TODO: Operate on a copy of the item/alarm/position so we can click cancel without updating the original
    $scope.position = position;
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
        var latLng = $scope.position.position;
        if(angular.isDefined(latLng.latitude) && angular.isDefined(latLng.longitude)){
            var formattedTime =  moment(position.time).format("YYYY-MM-DD HH:mm");
            var marker = {
                lng: latLng.longitude,
                lat: latLng.latitude,
                message: formattedTime,
                focus: true,
            };
            $scope.markers['reportedPosition'] = marker;

            //Center on the marker
            $scope.center.lat = latLng.latitude;
            $scope.center.lng = latLng.longitude;
            $scope.center.zoom = 10;
        }
    };

    //Is acceptAndPoll allowed?
    $scope.acceptAndPollIsAllowed = function() {
        //Only allowed for national vessels
        var nationalFlagState = 'SWE';
        return $scope.position.carrier.flagState === nationalFlagState;
    };

    //Get status label
    $scope.getStatusLabel = function(status){
        var label;
        switch(status){
            case 'SUCCESSFUL':
                label = locale.getString('common.status_successful');
                break;
            case 'PENDING':
                label = locale.getString('common.status_pending');
                break;
            case 'ERROR':
                label = locale.getString('common.status_failed');
                break;
            default:
                label = status;
        }
        return label;
    };

    $scope.toggleAssignAsset = function(){
        $scope.isVisible.assignAsset = !$scope.isVisible.assignAsset;
    };

    $scope.acceptAndPoll = function(){
        $log.info("TODO: Implement acceptAndPoll");
    };

    $scope.accept = function(){
        $log.info("TODO: Implement accept");
    };

    $scope.reject = function(){
        $log.info("TODO: Implement reject");
    };


    //VESSEL SEARCH

    var getListRequest = new GetListRequest(1, 5, false, []);
    //Search objects and results
    $scope.assignAssetSearchTypes = [{
        text: [locale.getString('vessel.ircs'), locale.getString('vessel.name'), locale.getString('vessel.cfr')].join('/'),
        code: 'ALL'
    }, {
        text: locale.getString('vessel.ircs'),
        code: 'IRCS'
    }, {
        text: locale.getString('vessel.name'),
        code: 'NAME'
    }, {
        text: locale.getString('vessel.cfr'),
        code: 'CFR'
    }];
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
        //TODO: Something?
        $log.info("TODO: What should happen now?");
    };



    $scope.init();
});

angular.module('unionvmsWeb').factory('PositionReportModal', function($modal) {
    return {
        show: function(position, options) {
            return $modal.open({
                templateUrl: 'partial/alarms/positionReportModal/positionReportModal.html',
                controller: 'PositionReportModalCtrl',
                windowClass : "positionReportModal",
                size: 'md',
                resolve:{
                    position : function (){
                        return position;
                    },
                    options : function (){
                        return options;
                    },
                }
            }).result;
        }
    };
});