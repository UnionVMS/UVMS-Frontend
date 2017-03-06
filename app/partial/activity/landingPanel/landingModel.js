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
 * @name Landing
 * @attr {Object} landingSummary - An object containing the fishing activity landingSummary data (like occurence, landingTime)
 * @attr {Object} port - An object containing all the data of the port of Landing
 * @attr {Object} reportDoc - An object containing all the data related with the fishing activity report document
 * @attr {Object} landingCatchData - An object containing all the data related with fishing data (like fish species, weights, gear used, locations etc... )
 * @description
 *  A model to store all the data related to a Landing in a standardized way
 */
angular.module('unionvmsWeb').factory('Landing', function(locale, fishingActivityService) {

    function Landing() {
        this.landingSummary = {
            occurence: undefined,
            landingTime: undefined
        };
        this.port = {
            name: undefined,
            coordinates: []
        };
        this.reportDoc = {
            type: undefined,
            dateAccepted: undefined,
            id: undefined,
            refId: undefined,
            creationDate: undefined,
            purposeCode: undefined,
            purpose: undefined
        };
        this.landingCatchData = [];
    }

    /**
     * Load the model with data
     * 
     * @memberof Landing
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    Landing.prototype.fromJson = function(data) {
        this.landingSummary = loadSummaryData(data.landingSummary);
        this.port = data.port;
        this.reportDoc = fishingActivityService.loadFaDocData(data.reportDoc);
        this.landingCatchData = data.landingCatchData;
    };

    var loadSummaryData = function(data){

        var attrOrder = {
            occurence: {
                type: 'date'
            },
            startOfLanding: {
                type: 'date'
            },
            endOfLanding: {
                type: 'date'
            }
        };

        var finalSummary = fishingActivityService.loadFishingActivityDetails(data, attrOrder);

        finalSummary.title = locale.getString('activity.title_fishing_activity') + ': '+ locale.getString('activity.trip_landing');
        finalSummary.subTitle = locale.getString('activity.trip_landing_time');

        return finalSummary;
    };

    return Landing;
});
