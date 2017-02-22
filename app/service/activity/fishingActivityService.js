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
 * @name fishingActivityService
 * @param Departure {Model} The model for Departure fissing activities <p>{@link unionvmsWeb.Departure}</p>
 * @param activityRestService {Service} The activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @attr {Object} activityData - An object containing the activity data that will be used in the different views
 * @description
 *  A service to deal with any kind of fishing activity operation (e.g. Departure, Arrival, ...)
 */
angular.module('unionvmsWeb').factory('fishingActivityService', function (Departure, ArrivalNotification, Arrival, Landing, activityRestService, loadingStatus) {

    var faServ = {
        activityData: {},
        id: undefined,
        isCorrection: false
    };

	/**
	 * Get fishing activity operation data from server
	 * 
	 * @memberof fishingActivityService
	 * @public
	 * @alias getData
	 * @param {String} type - The activity type (e.g. departure)
	 */
    faServ.getData = function (type, callback) {
        //faServ.resetActivityData();
        var uType = type.toUpperCase();

        switch (uType) {
            case 'DEPARTURE':
                getDeparture();
                break;
            case 'NOTIFICATION_ARRIVAL':
                getNotificationArrival(callback);
                break;
            case 'ARRIVAL':
                getArrival(callback);
                break;
            case 'LANDING':
                getLanding();
                break;
            //TODO other types of fa operations
        }
    };

	/**
	 * Reset fishing activity service
	 * 
	 * @memberof fishingActivityService
	 * @public
	 * @alias resetActivity
	 */
    faServ.resetActivity = function () {
        faServ.activityData = {};
        faServ.id = undefined;
        faServ.isCorrection = false;
    };

	/**
     * Reset activity data within the service
     * 
     * @memberof fishingActivityService
     * @public
     * @alias resetActivityData
     */
    faServ.resetActivityData = function () {
        faServ.activityData = {};

    };

	/**
	 * Get data specifically for departure operations
	 * 
	 * @memberof fishingActivityService
	 * @private
	 */
    function getDeparture() {

        //TODO use fa id in the REST request
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getFishingActivityDetails('departure').then(function (response) {
            faServ.activityData = new Departure();
            faServ.activityData.fromJson(response);
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    }

	/**
	 * Get data specifically for Notification of arrival operations
	 * 
	 * @memberof fishingActivityService
	 * @private
	 */
    function getNotificationArrival(callback) {

        //TODO use fa id in the REST request
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getFishingActivityDetails('arrival_notification').then(function (response) {
            faServ.activityData = new ArrivalNotification();
            faServ.activityData.fromJson(response);
            callback();
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    }

	/**
	 * Get data specifically for Arrival operations
	 * 
	 * @memberof fishingActivityService
	 * @private
	 */
    function getArrival(callback) {
        //TODO use fa id in the REST request
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getFishingActivityDetails('arrival').then(function (response) {
            faServ.activityData = new Arrival();
            faServ.activityData.fromJson(response);
            callback();
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    }

    /**
	 * Get data specifically for Landing operations
	 * 
	 * @memberof fishingActivityService
	 * @private
	 */
    function getLanding() {
        //TODO use fa id in the REST request
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getFishingActivityDetails('landing').then(function (response) {
            faServ.activityData = new Landing();
            faServ.activityData.fromJson(response);
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    }

    return faServ;
});
