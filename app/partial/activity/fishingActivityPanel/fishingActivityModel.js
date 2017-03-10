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
 * @name FishingActivity
 * @attr {String} faType - The fishing activity type (always departure)
 * @attr {String | Null} operationType - The fishing activity operation type (e.g. Correction)
 * @attr {Object} activityDetails - An object containing the fishing activity summary data (like occurence, reason, ...)
 * @attr {Object} locations - An object containing all the data of the port of departure
 * @attr {Array} gears - An array conatining objects that describe the available gears
 * @attr {Object} reportDetails - An object containing all the data related with the fishing activity report document
 * @attr {Object} catches - An object containing all the data related with fishing data (like fish species and weights retained on board, locations 
 * @description
 *  A model to store all the data related to a departure in a standardized way
 */
angular.module('unionvmsWeb').factory('FishingActivity',function(mdrCacheService, fishingActivityService, locale) {
    
    function FishingActivity(faType){
        this.faType = faType;
        this.operationType = undefined;
        this.activityDetails = undefined;
        this.locations = undefined;
        this.gears = undefined;
        this.reportDetails = undefined;
        this.catches = undefined;
    }
    
    /**
     * Load the model with data
     * 
     * @memberof FishingActivity
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    FishingActivity.prototype.fromJson = function(data){
        fishingActivityService.faFromJson(this,data);
    };
    
    return FishingActivity;
});
