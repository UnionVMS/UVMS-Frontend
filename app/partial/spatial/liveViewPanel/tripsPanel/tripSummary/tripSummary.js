/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name TripsummaryCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param tripSummaryService {Service} the trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @param loadingStatus {Service} the loading status service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @param $anchorScroll {Service} angular $anchorScroll service
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the trip summary tab  
 */
angular.module('unionvmsWeb').controller('TripsummaryCtrl',function($scope,activityRestService,tripSummaryService,loadingStatus,$anchorScroll,locale){
    $scope.tripSummServ = tripSummaryService;

    $scope.$watch('tripSummServ.isLoadingTrip', function(newVal){
        if(newVal){
            init();
        }
    });

    /**
     * Initialization function
     * 
     * @memberof TripsummaryCtrl
     * @private
     */
    var init = function(){
        loadingStatus.isLoading('TripSummary', true);
        activityRestService.getTripVessel($scope.trip.id).then(function(response){
            $scope.trip.fromJson('vessel',response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function(error){
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_vessel_data');
            $scope.alert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });

        activityRestService.getTripReports($scope.trip.id).then(function(response){
            $scope.trip.fromJson('reports',response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function(error){
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_reports');
            $scope.alert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
    };

    init();

});