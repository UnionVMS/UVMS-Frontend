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
angular.module('unionvmsWeb').controller('TripsummaryCtrl', function ($scope, activityRestService, tripSummaryService, loadingStatus, $anchorScroll, locale) {
    $scope.tripSummServ = tripSummaryService;
    $scope.panelData = {
        tableShown: true,
        legendTitle: locale.getString('activity.trip_summary_catch'),
        title: {
            onboard: locale.getString('activity.catch_panel_title_onboard'),
            landed: locale.getString('activity.catch_panel_title_landed')
        },
        loadingScreen: 'TripSummary',
        colWidth: 6
    };
     ($scope.panelData.tableShown) ? ($scope.panelData.colWidth = 6) : ($scope.panelData.colWidth = 12);
    //when tthe trip is being initialized
    $scope.$watch('tripSummServ.isLoadingTrip', function (newVal) {
        if (newVal) {
            init();
        }
    });

    /**
     * Initialization function
     * 
     * @memberof TripsummaryCtrl
     * @private
     */
    var init = function () {
        loadingStatus.isLoading('TripSummary', true);

       
        //get vessel and role data for the specified trip
        activityRestService.getTripVessel($scope.trip.id).then(function (response) {
            $scope.trip.fromJson('vessel', response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_vessel_data');
            $scope.alert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });

        //get activity reports data for the specified trip
        activityRestService.getTripReports($scope.trip.id).then(function (response) {
            $scope.trip.fromJson('reports', response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_reports');
            $scope.alert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
        // get trip catches data for the specific trip
        activityRestService.getTripCatches($scope.trip.id).then(function (response) {
            $scope.trip.fromJson('catch', response.data);
            $scope.loadingCharts = false;
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $scope.loadingCharts = false;
            $anchorScroll();
            $scope.tripAlert.hasAlert = true;
            $scope.tripAlert.hasError = true;
            $scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
            $scope.tripAlert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
    };

});