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
angular.module('unionvmsWeb').factory('FishingOperation',function() {
    
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
        this.gears = data.gears;
        this.reportDoc = data.reportDoc;
        this.fishingData = data.fishingData;
    };

    var loadSummaryData = function(data){

        var attrOrder = ['occurence','vessel_activity','no_operations','fishery_type','targetted_species','fishing_time'];
        var subAttrOrder = ['duration'];


        var finalSummary = {
            title: "Fishing activity: Fishing operation",
            subTitle: "Fishing time"
        };

        if(_.keys(data).length){
            finalSummary.items = {};
        }

        angular.forEach(attrOrder,function(attrName){
            if(angular.isObject(data[attrName]) && !angular.isArray(data[attrName])){
                if(!_.isEmpty(data[attrName])){
                    finalSummary.subItems = {};
                    angular.forEach(subAttrOrder,function(subAttrName){
                        finalSummary.subItems[subAttrName] = data[attrName][subAttrName];
                    });
                }
            }else{
                finalSummary.items[attrName] = data[attrName];
            }
        });

        return finalSummary;
    };

    /*$scope.model = {
        title: "Fishing activity: Fishing operation",
        subTitle: "Fishing time",
        items: {
            occurence: 'yy-mm-dd hh:mm',
            vessel_activity: 'FSH - Fishing',
            no_operations: 4,
            fishery_type: 'Demersal',
            targetted_species: 'COD'
        },
        subItems: {
            duration: '10h'
        }
    };*/
    
    return FishingOperation;
});
