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
 * @param Departure {Model} The model for Departure fishing activities <p>{@link unionvmsWeb.Departure}</p>
 * @param activityRestService {Service} The activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @attr {Object} activityData - An object containing the activity data that will be used in the different views
 * @description
 *  A service to deal with any kind of fishing activity operation (e.g. Departure, Arrival, ...)
 */
angular.module('unionvmsWeb').factory('fishingActivityService', function (activityRestService, loadingStatus, mdrCacheService, locale, $filter) {

    var faServ = {
        activityData: {},
        id: undefined,
        isCorrection: false
	};

    var faModels = {
        common: [
            'activityDetails',
            'reportDetails'
        ],
        departure: [
            'ports',
            'gears',
            'catches'
        ],
        landing: [
            'ports',
            'catches'
        ],
        arrival_notification: [
            'ports',
            'catches'
        ],
        arrival_declaration: [
            'ports',
            'gears'
        ],
        fishing_operation: [
            'ports',
            'gears',
            'catches'
        ],
        discard: [
            'ports'
        ],
        joint_fishing_operation: [
            'ports',
            'gears'
        ],
        relocation: [
            'ports'
        ],
        transhipment: [
            'ports'
        ]
    };

    var faSummaryAttrsOrder = {
        occurence: {
            type: 'date'
        },
        reason: {
            type: 'string'
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
        },
        startOfLanding: {
            type: 'date'
        },
        endOfLanding: {
            type: 'date'
        }
    };

    var gearAttrOrder = {
        meshSize: {
            type: 'string'
        },
        beamLength: {
            type: 'string'
        },
        numBeams: {
            type: 'string'
        }
    };

    var faDocAttrOrder = {
        type: {
            type: 'string'
        },
        dateAccepted: {
            type: 'date'
        },
        id: {
            type: 'string'
        },
        refId: {
            type: 'string',
            clickable: true
        },
        creationDate: {
            type: 'date'
        },
        purposeCode: {
            type: 'string'
        },
        purpose: {
            type: 'string'
        },
        FMC_marker: {
            type: 'string'
        }
    };


	
	/**
	 * Reset fishing activity service
	 * 
	 * @memberof fishingActivityService
	 * @public
	 * @alias resetActivity
	 */
	faServ.resetActivity = function(){
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
    faServ.resetActivityData = function(){
        faServ.activityData = {};
    };
	
	/**
	 * Get data for a specific fishing activity
	 * 
	 * @memberof fishingActivityService
	 * @public
     * @alias getFishingActivity
	 */
    faServ.getFishingActivity = function(obj, callback) {
        //TODO use fa id in the REST request
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getFishingActivityDetails(obj.faType).then(function (response) {
            faServ.activityData = obj;
            faServ.activityData.fromJson(response);
            if(angular.isDefined(callback)){
                callback();
            }
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    };

    /**
     * Adds gear description from MDR code lists into the gears type attribute.
     * 
     * @memberof fishingActivityService
     * @public
     * @param {Object} faObj - A reference to the Fishing activity object
     * @param {Array} data - An array containing the available gears
     * @alias addGearDescription
     */
    faServ.addGearDescription = function(faObj){
        mdrCacheService.getCodeList('gear_type').then(function(response){
            angular.forEach(faObj.gears, function(item) {
                var mdrRec = _.findWhere(response, {code: item.type});
                if (angular.isDefined(mdrRec)){
                    item.type = item.type + ' - ' + mdrRec.description;
                }
            });
        });
    };
    
    /**
     * Adds catch type description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @public
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias addCatchTypeDescription
     */
    faServ.addCatchTypeDescription = function(faObj){
        mdrCacheService.getCodeList('fa_catch_type').then(function(response){
            angular.forEach(faObj.fishingData, function(item) {
                var mdrRec = _.findWhere(response, {code: item.details.catchType});
                if (angular.isDefined(mdrRec)){
                    item.details.typeDesc = mdrRec.description;
                }
            });
        });
    };
	
	/**
     * Adds weight means description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @public
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias addWeightMeansDescription
     */
    faServ.addWeightMeansDescription = function(faObj){
        mdrCacheService.getCodeList('weight_means').then(function(response){
            angular.forEach(faObj.fishingData, function(item) {
                var mdrRec = _.findWhere(response, {code: item.details.weightMeans});
                if (angular.isDefined(mdrRec)){
                    item.details.weightMeansDesc = mdrRec.description;
                }
            });
        });
    };

    /**
     * Adds weight means description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @public
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias loadFishActivityOverview
     */
    faServ.loadFishingActivityDetails = function(data, attrOrder){
        var attrKeys = _.keys(attrOrder);
        var finalSummary = {};

        if(_.keys(data).length){
            finalSummary.items = {};
        }

        angular.forEach(data,function(value,key){
            if(angular.isObject(value) && !angular.isArray(value)){
                if(!_.isEmpty(value)){
                    finalSummary.subTitle = locale.getString('activity.trip_' + key);
                    finalSummary.subItems = {};
                    angular.forEach(value,function(subItem,subKey){
                        finalSummary.subItems[subKey] = transformFaItem(subItem, subKey, attrOrder, attrKeys);
                    });
                }
            }else{
                finalSummary.items[key] = transformFaItem(value, key, attrOrder, attrKeys);
            }
        });

        return finalSummary;
    };

    var transformFaItem = function(value, key, attrOrder, attrKeys){
        var newVal = value;
        
        if(attrOrder[key].type === 'date'){
            newVal = $filter('stDateUtc')(newVal);
        }else if(angular.isArray(value)){
            newVal = '';
            angular.forEach(value,function(arrItem,arrIdx){
                newVal += arrItem + ', ';
                if(value.length-1 === arrIdx){
                    newVal = newVal.slice(0, newVal.length-3);
                }
            });
        }

        return {
            idx: attrKeys.indexOf(key),
            value: newVal,
            clickable: attrOrder[key].clickable
        };
    };

    faServ.loadFaDocData = function(data){
        var finalSummary = this.loadFishingActivityDetails(data, faDocAttrOrder);

        finalSummary.title = locale.getString('activity.activity_report_doc_title');
        finalSummary.subTitle = locale.getString('activity.activity_related_flux_doc_title');

        return finalSummary;
    };

    faServ.loadGears = function(data){
        for(var i=0;i<data.length;i++){
            data[i].characteristics = this.loadFishingActivityDetails(data[i].characteristics, gearAttrOrder);
            data[i].characteristics.title = locale.getString('activity.characteristics');
        }
        var gears = data;

        return gears;
    };

    faServ.loadSummaryData = function(faType,data){
        var exceptions = ['arrival_notification', 'arrival_declaration'];
        var finalSummary;

        if(exceptions.indexOf(faType) === -1){
            finalSummary = this.loadFishingActivityDetails(data, faSummaryAttrsOrder);
            finalSummary.title = locale.getString('activity.title_fishing_activity') + ': '+ locale.getString('activity.fa_type_' + faType);
        }else{
            finalSummary = data;
        }

        return finalSummary;
    };

    faServ.loadFishingData = function(data){

        if(angular.isDefined(data) && data.length && angular.isDefined(data[0].gears)){
            angular.forEach(data, function(item){
                item.gears = faServ.loadGears(item.gears);
            });
        }

        return data;
    };

    faServ.faFromJson = function(obj,data){
        var model = faModels.common.concat(angular.isDefined(faModels[obj.faType]) ? faModels[obj.faType] : []);

        angular.forEach(model, function(dataType){
            switch(dataType){
                case 'activityDetails':
                    obj.activityDetails = faServ.loadSummaryData(obj.faType,data.activityDetails);
                    break;
                case 'reportDetails':
                    obj.reportDetails = faServ.loadFaDocData(data.reportDetails);
                    break;
                case 'ports':
                    obj.ports = data.ports;
                    break;
                case 'gears':
                    obj.gears = faServ.loadGears(data.gears);
                    break;
                case 'catches':
                    obj.catches = faServ.loadFishingData(data.catches);
                    break;
            }
        });

        this.addGearDescription(obj);
        this.addCatchTypeDescription(obj);
        this.addWeightMeansDescription(obj);

        return obj;
    };
    
	return faServ;
});
