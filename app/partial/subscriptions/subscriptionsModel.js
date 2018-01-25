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
 * @ngdoc model
 * @name Subscription
 * @param unitConversionService {Service} The unit conversion service
 * @description
 *  A model to store all the data related to a subscription in a standardized way
 */
angular.module('unionvmsWeb').factory('Subscription', function (unitConversionService) {
	function Subscription(isForSearch) {
	    if (angular.isUndefined(isForSearch)){
	        isForSearch = false;
        }

	    this.guid = undefined;
	    this.id = undefined;
		this.name = undefined;
		this.isActive = isForSearch === true ? 'all' : false;
        this.organisation = undefined;
        this.endPoint = undefined;
        this.communicationChannel = undefined;
        this.subscriptionType = isForSearch === true ? undefined : 'TX_PUSH';
        this.accessibility = isForSearch === true ? undefined : 'PUBLIC';
        this.description = undefined;
		this.startDate = undefined;
		this.endDate = undefined;
        this.delay = undefined;
        this.messageType = isForSearch === true ? undefined : 'FLUX_FA_REPORT_MESSAGE';
        this.triggerType = isForSearch === true ? undefined : 'MANUAL';
        this.conditions = isForSearch === true ? undefined : [];
        this.areas = isForSearch === true ? undefined : [];
        this.stateType = undefined;
	}

    /**
     * Load the model with data
     *
     * @memberOf Subscription
     * @param {Object} data - The source data to fill in the model
     * @returns {Subscription}
     * @constructor
     */
	Subscription.prototype.DTO = function(data){
	  var sub = new Subscription(true);
	  delete sub.stateType;

      sub.name = data.name;
	  sub.isActive = data.isActive;
	  sub.organisation = parseInt(data.organisation);
      sub.endPoint = parseInt(data.endPoint);
      sub.communicationChannel = parseInt(data.communicationChannel);
      sub.subscriptionType = data.subscriptionType;
      sub.accessibility = data.accessibility;
      sub.description = data.description;
      sub.startDate = data.startDate;
      sub.endDate = data.endDate;
      sub.delay = data.delay;
      sub.messageType = data.messageType;
      sub.triggerType = data.triggerType;

      if (angular.isDefined(data.id)){
          sub.id = data.id;
      }

      if (angular.isDefined(data.guid)){
          sub.guid = data.guid;
      }

      return sub;
    };

    /**
     * Convert a Subscription to a JSON string
     *
     * @memberOf Subscription
     * @param {Object} data - The subscription data to be converted
     * @returns {string} A JSON formatted string with the subscription
     */
    Subscription.prototype.toJson = function(data){
        var sub = this.DTO(data);
        sub.startDate = unitConversionService.date.convertDate(sub.startDate, 'to_server');
        sub.endDate = unitConversionService.date.convertDate(sub.endDate, 'to_server');

        return angular.toJson(sub);
    };

    /**
     * Convert s JSON string to a Subscription object
     *
     * @memberOf Subscription
     * @param {Obejct} data - The subscription data to be converted
     * @returns {Subscription} The subscription object
     */
    Subscription.prototype.fromJson = function(data){
        var sub = this.DTO(data);
        sub.startDate = unitConversionService.date.convertDate(sub.startDate, 'from_server');
        sub.endDate = unitConversionService.date.convertDate(sub.endDate, 'from_server');

        return sub;
    };

	return Subscription;
});

