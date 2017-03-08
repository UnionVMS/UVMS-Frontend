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
 * @name Departure
 * @attr {String} faType - The fishing activity type (always departure)
 * @attr {String | Null} operationType - The fishing activity operation type (e.g. Correction)
 * @attr {Object} summary - An object containing the fishing activity summary data (like occurence, reason, ...)
 * @attr {Object} port - An object containing all the data of the port of departure
 * @attr {Array} gears - An array conatining objects that describe the available gears
 * @attr {Object} reportDoc - An object containing all the data related with the fishing activity report document
 * @attr {Object} fishingData - An object containing all the data related with fishing data (like fish species and weights retained on board, locations 
 * @description
 *  A model to store all the data related to a departure in a standardized way
 */
angular.module('unionvmsWeb').factory('FishingOperation',function(fishingActivityService,locale) {
    
    function FishingOperation(){
        this.faType = 'fa_type_fishing_operation';
        this.operationType = undefined;
        this.summary = {
            occurence: undefined,
            reason: undefined,
            fisheryType: undefined,
            targetedSpecies: []
        };
        this.port = {
            name: undefined,
            coordinates: []
        };
        this.gears = [];
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
     * @memberof Departure
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    FishingOperation.prototype.fromJson = function(data){
        this.summary = loadSummaryData(data.summary);
        this.port = data.port;
        this.gears = fishingActivityService.loadGears(data.gears);
        this.reportDoc = fishingActivityService.loadFaDocData(data.reportDoc);
        this.fishingData = loadFishingData(data.fishingData);
        fishingActivityService.addGearDescription(this);
        fishingActivityService.addCatchTypeDescription(this);
        fishingActivityService.addWeightMeansDescription(this);
    };

    var loadSummaryData = function(data){

        var attrOrder = {
            occurence: {
                type: 'date'
            },
            vessel_activity: {
                type: 'string'
            },
            no_operations: {
                type: 'string'
            },
            fisheryType: {
                type: 'string'
            },
            targetedSpecies: {
                type: 'array'
            },
            duration: {
                type: 'string'
            }
        };

        var finalSummary = fishingActivityService.loadFishingActivityDetails(data, attrOrder);

        finalSummary.title = locale.getString('activity.title_fishing_activity') + ': '+ locale.getString('activity.fa_type_fishing_operation');
        finalSummary.subTitle = locale.getString('activity.fishing_time');

        return finalSummary;
    };

    var loadFishingData = function(data){
        angular.forEach(data, function(item){
            item.gears = fishingActivityService.loadGears(item.gears);
        });
        return data;
    };

    return FishingOperation;
});
