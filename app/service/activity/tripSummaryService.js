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
 * @ngdoc service
 * @name tripSummaryService
 * @parama $timeout {Service} the angular timeout service
 * @param loadingStatus {Service} the loading status service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param spatialConfigAlertService {Service} the spatial config alert service <p>{@link unionvmsWeb.spatialConfigAlertService}</p>
 * @param $anchorScroll {Service} angular $anchorScroll service
 * @param locale {Service} angular locale service
 * @attr {unionvmsWeb.Trip} trip - The current trip in trip summary
 * @attr {Object} mapConfigs - A property object that will contain the cronology of trips related to the current trip
 * @attr {Array} tabs - A property object that will be the catch details
 * @description
 *  Service to manage the trip summary view in the application
 */
angular.module('unionvmsWeb').factory('tripSummaryService',function($timeout, loadingStatus, activityRestService, spatialConfigAlertService, $anchorScroll, locale) {
	var tripSummaryService = {
	    withMap: undefined,
	    trip: undefined,
	    mapConfigs: undefined,
        tabs: undefined,
        isLoadingTrip: undefined
	};

    /**
     * Open a new tab with a specific trip
     * 
     * @memberof tripSummaryService
     * @public
     * @param {String} tripId - trip id
     * @param {Boolean} [fromPopup] - whether the new trip is being called from the acitvity popup or not
	 * @alias openNewTrip
     */
    tripSummaryService.openNewTrip = function(tripId, fromPopup){
        if (angular.isDefined(fromPopup) && fromPopup){
            this.initializeTrip(tripId);
        } else {
            var self = this;

            if(!angular.isDefined(this.tabs)){
                this.tabs = [];
            }
            
            angular.forEach(this.tabs, function(item) {
                item.active = false;
            });

            if(_.where(this.tabs, {title: tripId}).length === 0){
                this.tabs.push({title: tripId, active: true});
                this.initializeTrip(this.tabs[this.tabs.length-1].title);
            }else{
                angular.forEach(this.tabs, function(value,key){
                    if(value.title === tripId){
                        value.active = true;
                        self.initializeTrip(value.title);
                    }
                });
            }
        }
    };

    /**
     * Reset map configs
     * 
     * @memberof tripSummaryService
     * @public
	 * @alias resetMapConfigs
     */
	tripSummaryService.resetMapConfigs = function(){
	    this.mapConfigs = undefined;
	};
	
	/**
	 * Initialize trip summary requests
	 * 
	 * @memberof tripSummaryService
	 * @public
	 * @alias initTripSummary
	 */
	tripSummaryService.initTripSummary = function(){
	    var self = this;
	    loadingStatus.isLoading('TripSummary', true);
        //get vessel and role data for the specified trip
        activityRestService.getTripVessel(self.trip.id).then(function (response) {
            self.trip.fromJson('vessel', response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            spatialConfigAlertService.hasAlert = true;
            spatialConfigAlertService.hasError = true;
            spatialConfigAlertService.alertMessage = locale.getString('activity.error_loading_trip_summary_vessel_data');
            spatialConfigAlertService.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });

        loadingStatus.isLoading('TripSummary', true);
        //get activity reports data for the specified trip
        activityRestService.getTripReports(self.trip.id).then(function (response) {
            self.trip.fromJson('reports', response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            spatialConfigAlertService.hasAlert = true;
            spatialConfigAlertService.hasError = true;
            spatialConfigAlertService.alertMessage = locale.getString('activity.error_loading_trip_summary_reports');
            spatialConfigAlertService.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });

        loadingStatus.isLoading('TripSummary', true);
        // get trip catches data for the specific trip
        activityRestService.getTripCatches(self.trip.id).then(function (response) {
            self.trip.fromJson('catch', response.data);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            spatialConfigAlertService.hasAlert = true;
            spatialConfigAlertService.hasError = true;
            spatialConfigAlertService.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
            spatialConfigAlertService.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
        
        loadingStatus.isLoading('TripSummary', true);
        // get trip map data for the specific trip
        activityRestService.getTripMapData(self.trip.id).then(function (response) {
            self.trip.fromJson('mapData', response);
            loadingStatus.isLoading('TripSummary', false);
        }, function (error) {
            $anchorScroll();
            spatialConfigAlertService.hasAlert = true;
            spatialConfigAlertService.hasError = true;
            spatialConfigAlertService.alertMessage = locale.getString('activity.error_loading_trip_summary_map_data');
            spatialConfigAlertService.hideAlert();
            loadingStatus.isLoading('TripSummary', false);
        });
	};
	
	return tripSummaryService;
});
