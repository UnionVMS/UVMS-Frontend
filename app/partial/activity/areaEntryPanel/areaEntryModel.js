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
 * @name AreaEntry
 * @attr {Object} summary - An object containing the fishing activity landingSummary data (like occurence, landingTime)
 * @attr {Object} reportDoc - An object containing all the data related with the fishing activity report document
 * @description
 *  A model to store all the data related to a Area Entry in a standardized way
 */
angular.module('unionvmsWeb').factory('AreaEntry', function (locale, fishingActivityService) {

    function AreaEntry() {
        this.summary = undefined;
        this.reportDoc = undefined;
    }

    /**
     * Load the model with data
     * 
     * @memberof AreaEntry
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    AreaEntry.prototype.fromJson = function (data) {
        this.summary = loadSummaryData(data.summary);
        this.reportDoc = data.reportDoc;
        fishingActivityService.addGearDescription(this);
        fishingActivityService.addCatchTypeDescription(this);
        fishingActivityService.addWeightMeansDescription(this);
    };

    var loadSummaryData = function (data) {

        var attrOrder = ['occurence', 'landingTime'];
        var subAttrOrder = ['startOfLanding', 'endOfLanding'];


        var finalSummary = {
            title: locale.getString('activity.title_fishing_activity') + ':' + locale.getString('activity.trip_landing'),
            subTitle: locale.getString('activity.trip_landing_time')
        };

        if (_.keys(data).length) {
            finalSummary.items = {};
        }

        angular.forEach(attrOrder, function (attrName) {

            if (angular.isObject(data[attrName]) && !angular.isArray(data[attrName])) {
                if (!_.isEmpty(data[attrName])) {
                    finalSummary.subItems = {};
                    angular.forEach(subAttrOrder, function (subAttrName) {
                        finalSummary.subItems[subAttrName] = data[attrName][subAttrName];
                    });
                }
            } else {
                finalSummary.items[attrName] = data[attrName];
            }
        });



        return finalSummary;
    };

    return AreaEntry;
});
