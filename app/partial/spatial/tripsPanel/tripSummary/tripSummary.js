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
    
    //when the trip is being initialized
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

        loadingStatus.isLoading('TripSummary', true);
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

        loadingStatus.isLoading('TripSummary', true);
        // get trip catches data for the specific trip
        activityRestService.getTripCatches($scope.trip.id).then(function (response) {
            $scope.trip.fromJson('catch', response.data);
            $scope.loadingCharts = false;
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $scope.loadingCharts = false;
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
            $scope.alert.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
    };

});
