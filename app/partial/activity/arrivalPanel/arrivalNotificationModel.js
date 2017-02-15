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
 * @name ArrivalNotification
 * @attr {Object} arrival - An object containing all the data of arrival
 * @attr {Object} port - An object containing all the data of the port of arrival
 * @attr {Object} reportDoc - An object containing all the data related with the fishing activity report document
 * @attr {Object} arrivalCatchData- An object containing all the data related with fishing data (like fish species and weights retained on board, locations 
 * @description
 *  A model to store all the data related to a Notification of arrival in a standardized way
 */
angular.module('unionvmsWeb').factory('ArrivalNotification', function() {

    function ArrivalNotification() {
       
        this.arrival = {
            estimatedArrival: "",
            reason: ""
        };
        this.port = {
            name: undefined,
            coordinates: []
        };
        this.reportDoc = {
            type: undefined,
            id: undefined,
            refId: undefined,
            creationDate: undefined,
            purposeCode: undefined,
            purpose: undefined
        };
        this.fishingData = [];
    }

    /**
     * Load the model with data
     * 
     * @memberof ArrivalNotification
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    ArrivalNotification.prototype.fromJson = function(data) {
        this.arrival = data.arrival;
        this.port = data.port;
        this.reportDoc = data.reportDoc;
        this.fishingData = data.arrivalCatchData;
    };

    return ArrivalNotification;
});
