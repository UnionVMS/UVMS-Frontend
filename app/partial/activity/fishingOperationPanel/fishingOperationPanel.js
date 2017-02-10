angular.module('unionvmsWeb').controller('FishingoperationpanelCtrl',function($scope,fishingActivityService,loadingStatus,$state,tripSummaryService,activityRestService){

    $scope.faServ = fishingActivityService;
    
    var init = function(){
        $scope.faServ.getData('fishing_operation');
        loadingStatus.isLoading('FishingActivity', true);
        //activityRestService.getTripCatchDetail($scope.faServ.id).then(function(response){
        //FIXME id is hardcoded
        activityRestService.getTripCatchDetail('1').then(function(response){
            $scope.fishingTripDetails = response;  
            loadingStatus.isLoading('FishingActivity', false);
        }, function(error){
            //TODO deal with error from service
            loadingStatus.isLoading('FishingActivity', false);
        });
    };

    /**
     * Check if a location tile should be clickable taking into consideration the route and the report configuration
     * 
     * @memberof DeparturepanelCtrl
     * @public
     * @alias isLocationClickable
     * @returns {Boolean} Whether the location tile should be clickable or not
     */
    $scope.isLocationClickable = function(){
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && tripSummaryService.withMap){
            clickable = true;
        }
        
        return clickable;
    };

    /**
     * The click location callback function
     * 
     * @memberof DeparturepanelCtrl
     * @public
     * @alias locationClickCallback
     */
    $scope.locationClickCallback = function(){
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        console.log('This is the click callback');
    };

    init();
});