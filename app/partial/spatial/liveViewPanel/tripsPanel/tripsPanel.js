/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name TripspanelCtrl
 * @param $scope {Service} controller scope
 * @param genericMapService {Service} the generic map service <p>{@link unionvmsWeb.genericMapService}</p>
 * @param tripSummaryService {Service} the trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @param spatialConfigAlertService {Service} the spatial config alert service <p>{@link unionvmsWeb.spatialConfigAlertService}</p>
 * @param Trip {unionvmsWeb.Trip} the loading status service <p>{@link unionvmsWeb.Trip}</p>
 * @description
 *  The controller for the trip summary tab  
 */
angular.module('unionvmsWeb').controller('TripspanelCtrl',function($scope, genericMapService, tripSummaryService, spatialConfigAlertService, Trip){

    $scope.alert = spatialConfigAlertService;
    $scope.tripSummServ = tripSummaryService;
    
    $scope.tripSummServ.resetMapConfigs();
    
    /**
     * Sets map configs in trip summary service
     * 
     * @memberof TripspanelCtrl
     * @private
     */
    var setTripSumServiceMapConfigs = function(){
        $scope.tripSummServ.mapConfigs = angular.copy(genericMapService.mapBasicConfigs);
    };
    
    genericMapService.setMapBasicConfigs(setTripSumServiceMapConfigs);

    /**
     * Close a trip summary tab
     * 
     * @memberof TripspanelCtrl
     * @public
     * @alias closeTab
     * @param {Number} index - The index of the tab to be closed
     */
    $scope.closeTab = function(index){
        $scope.tripSummServ.tripTabs.splice(index,1);
        if($scope.tripSummServ.tripTabs.length < 1){
            $scope.repNav.goToPreviousView();
        }
    };

    /**
     * Initialize trip model for the current trip summary tab
     * 
     * @memberof tripSummaryService
     * @public
     * @alias initializeTrip
     * @param {Number} index - The index of the tab to be initialized
     */
    $scope.tripSummServ.initializeTrip = function(index){
        if(angular.isDefined($scope.tripSummServ.tripTabs[index])){
            $scope.tripSummServ.trip = new Trip($scope.tripSummServ.tripTabs[index]);
            $scope.trip = $scope.tripSummServ.trip;
        }
    };

});