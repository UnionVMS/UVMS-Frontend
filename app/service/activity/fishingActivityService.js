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
            'locations',
            'gears',
            'catches'
        ],
        landing: [
            'locations',
            'catches'
        ],
        arrival_notification: [
            'locations',
            'catches'
        ],
        arrival_declaration: [
            'locations',
            'gears'
        ],
        fishing_operation: [
            'locations',
            'gears',
            'catches'
        ],
        discard: [
            'locations'
        ],
        joint_fishing_operation: [
            'locations',
            'gears'
        ],
        relocation: [
            'locations'
        ],
        transhipment: [
            'locations'
        ]
    };

    var faSummaryAttrsOrder = [
        {
            id: 'occurence',
            type: 'date'
        },
        {
            id: 'reason',
            type: 'string'
        },
        {
            id: 'vessel_activity',
            type: 'string'
        },
        {
            id: 'no_operations',
            type: 'string'
        },
        {
            id: 'fisheryType',
            type: 'string'
        },
        {
            id: 'targetedSpecies',
            type: 'array'
        },
        {
            id: 'duration',
            type: 'string'
        },
        {
            id: 'startOfLanding',
            type: 'date'
        },
        {
            id: 'endOfLanding',
            type: 'date'
        }
    ];

    var gearAttrOrder = [
        {
            id: 'meshSize',
            type: 'string'
        },
        {
            id: 'lengthWidth',
            type: 'string'
        },
        {
            id: 'numberOfGears',
            type: 'string'
        },
        {
            id: 'height',
            type: 'string'
        },
        {
            id: 'nrOfLines',
            type: 'string'
        },
        {
            id: 'nrOfNets',
            type: 'string'
        },
        {
            id: 'nominalLengthOfNet',
            type: 'string'
        },
        {
            id: 'quantity',
            type: 'string'
        },
        {
            id: 'description',
            type: 'string'
        }
    ];

    var faDocAttrOrder = [
        {
            id: 'type',
            type: 'string'
        },
        {
            id: 'creationDate',
            type: 'date'
        },
        {
            id: 'purposeCode',
            type: 'string'
        },
        {
            id: 'purpose',
            type: 'string'
        },
        {
            id: 'owner',
            type: 'string'
        },
        {
            id: 'id',
            type: 'string'
        },
        {
            id: 'refId',
            type: 'string',
            clickable: true
        },
        {
            id: 'acceptedDate',
            type: 'date'
        },
        {
            id: 'fmcMark',
            type: 'string'
        }
    ];


	
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
            angular.forEach(faObj.catches, function(item) {
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
            var classes = ['lsc','bms'];
            angular.forEach(faObj.catches, function(item) {
                angular.forEach(classes, function(className) {
                    var mdrRec = _.findWhere(response, {code: item[className].classProps.weightingMeans});
                    if (angular.isDefined(mdrRec)){
                        if(!angular.isDefined(item[className].classDescs)){
                            item[className].classDescs = {};
                        }
                        item[className].classDescs.weightingMeansDesc = mdrRec.description;
                    }
                });
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
        var attrKeys = _.pluck(attrOrder, 'id');
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
                        if(angular.isDefined(subItem) && !_.isNull(subItem) && subItem.length > 0){
                            finalSummary.subItems[subKey] = transformFaItem(subItem, subKey, attrOrder, attrKeys);
                        }
                    });
                }
            }else if(angular.isDefined(value) && !_.isNull(value) && value.length > 0){
                finalSummary.items[key] = transformFaItem(value, key, attrOrder, attrKeys);
            }
        });

        return finalSummary;
    };

    var transformFaItem = function(value, key, attrOrder, attrKeys){
        var newVal = value;
        var attrData = _.where(attrOrder, {id: key});
        
        if(angular.isDefined(attrData.length) && attrData.type === 'date'){
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

        var itemLabel = locale.getString('activity.fa_details_item_' + key);

        return {
            idx: attrKeys.indexOf(key),
            label: itemLabel !== "%%KEY_NOT_FOUND%%" ? itemLabel : key,
            value: newVal,
            clickable: attrData.length ? attrData.clickable : undefined
        };
    };

    faServ.loadFaDocData = function(data){
        var relatedReports;
        var attrOrder = angular.copy(faDocAttrOrder);
        var relRepIdx = attrOrder.length;

        if(angular.isDefined(data.relatedReports) && data.relatedReports.length > 0){
            relatedReports = angular.copy(data.relatedReports);
            data.relatedReports = {};
            angular.forEach(relatedReports, function(report){
                data.relatedReports[report.schemeId] = report.id;

                attrOrder.push({
                    idx: relRepIdx,
                    id: report.schemeId,
                    type: 'string'
                });
                relRepIdx++;
            });
        }

        

        var finalSummary = this.loadFishingActivityDetails(data, attrOrder);

        finalSummary.title = locale.getString('activity.activity_report_doc_title');

        if(angular.isDefined(finalSummary.subItems)){
            finalSummary.subTitle = locale.getString('activity.activity_related_flux_doc_title');
        }

        return finalSummary;
    };

    faServ.loadGears = function(data){
        angular.forEach(data, function(gear){
            var gearAttrs = _.keys(gear);
            if(gearAttrs.length > 2){
                gear.characteristics = {};
                gear.characteristicsDetails = {};
                angular.forEach(gearAttrs,function(attrName){
                    var nonCharacteristics = ['type','role'];
                    var mainCharacteristics = ['meshSize','lengthWidth','numberOfGears'];

                    if(nonCharacteristics.indexOf(attrName) === -1){
                        if(mainCharacteristics.indexOf(attrName) === -1){
                            gear.characteristicsDetails[attrName] = gear[attrName];
                        }else{
                            gear.characteristics[attrName] = gear[attrName];
                        }
                        delete gear[attrName];
                    }
                });
                gear.characteristics = faServ.loadFishingActivityDetails(gear.characteristics, gearAttrOrder);
                gear.characteristics.title = locale.getString('activity.characteristics');
            }
        });

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

    faServ.loadFishingData = function(obj,data){
        if(angular.isDefined(data) && data.length){
            var classes = ['lsc','bms'];
            angular.forEach(data, function(item){
                angular.forEach(classes, function(className){
                    if(angular.isDefined(item[className].gears)){
                        item[className].gears = faServ.loadGears(item[className].gears);
                    }

                    item[className].classProps = {};
                    
                    if(angular.isDefined(item[className].destinationLocation) && angular.isDefined(item[className].destinationLocation[0])){
                        item[className].destinationLocation = item[className].destinationLocation[0].id + ' - ' + item[className].destinationLocation[0].name + ', ' +
                                                    item[className].destinationLocation[0].countryId;
                    }

                    angular.forEach(item[className], function(attr,attrName){
                        if(!_.isObject(attr) && !_.isArray(attr)){
                            item[className].classProps[attrName] = attr;
                            delete item[className][attrName];
                        }
                    });
                });
            });
        }
        this.addGearDescription(obj);
        /*this.addCatchTypeDescription(obj);*/
        this.addWeightMeansDescription(obj);

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
                case 'locations':
                    obj.locations = data.locations;
                    break;
                case 'gears':
                    obj.gears = faServ.loadGears(data.gears);
                    break;
                case 'catches':
                    obj.catches = faServ.loadFishingData(obj,data.catches);
                    break;
            }
        });

        return obj;
    };
    
	return faServ;
});
