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
 * @param activityRestService {Service} The activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param loadingStatus {Service} loading message service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @param mdrCacheService {Service} The mdr code lists cache service <p>{@link unionvmsWeb.mdrCacheService}</p>
 * @param locale {service} angular locale service
 * @param $filter {Service} angular filter service
 * @param $state {Service} The angular $state service
 * @param tripSummaryService {Service} The trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @attr {Object} activityData - An object containing the activity data that will be used in the different views
 * @attr {String} id - Id of the current fishing activity
 * @attr {Boolean} isCorrection - Tells if the current fishing activity is a correction
 * @description
 *  A service to deal with any kind of fishing activity operation (e.g. Departure, Arrival, ...)
 */
angular.module('unionvmsWeb').factory('fishingActivityService', function(activityRestService, loadingStatus, mdrCacheService, locale, $filter, $state, tripSummaryService) {

    var faServ = {
        activityData: {},
        id: undefined,
        isCorrection: false,
        activityType: undefined
	};

    //tiles per fishing activity view
    var faModels = {
        common: [
            'activityDetails',
            'reportDetails',
            'tripDetails'
        ],
        departure: [
            'locations',
            'gears',
            //'catches',
            'processingProducts',
            'gearShotRetrieval'
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
            'gears',
            'relocation'
        ],
        relocation: [
            'locations'
        ],
        transhipment: [
            'locations'
        ],
        area_entry: [
            'areas'
        ],
        area_exit: [
            'areas'
        ]
    };

    //Configs of activity details attributes
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

    //Configs of gear tile attributes
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

    //Configs of report details attributes
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


    //Configs of vessel details attributes
    var vesselAttrOrder = [
        {
            id: 'role',
            type: 'string'
        },
        {
            id: 'name',
            type: 'string'
        },
        {
            id: 'country',
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
	    faServ.activityType = undefined;
	};
	
	/**
     * Reset activity data within the service
     * 
     * @memberof fishingActivityService
     * @public
     * @alias resetActivityData
     */
    faServ.resetActivityData = function() {
        faServ.activityData = {};
    };
    
    /**
     * Get the view name for requesting data on each activity type
     * 
     * @memberof fishingActivityService
     * @private
     * @param {String} type - The fishing activity type (e.g. area_exit)
     * @returns {String} The view name
     */
    function getViewNameByFaType(type){
        var views = {
            area_exit: 'areaExit'
        };
        
        //TODO add all activity types
        
        return views[type.toLowerCase()];
    }

	/**
	 * Get data for a specific fishing activity
	 * 
	 * @memberof fishingActivityService
	 * @public
     * @alias getFishingActivity
	 */
    faServ.getFishingActivity = function(obj, callback) {
        loadingStatus.isLoading('FishingActivity', true);
        var payload = {
            activityId: faServ.id
        };
        
        if ($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting'){
            payload.tripId = tripSummaryService.trip.id;
        }
        
        activityRestService.getFishingActivityDetails(getViewNameByFaType(obj.faType), payload).then(function (response) {
            faServ.activityData = obj;
            faServ.activityData.fromJson(response);
            if (angular.isDefined(callback)) {
                callback();
            }
            loadingStatus.isLoading('FishingActivity', false);
        }, function(error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    };

    /**
     * Adds gear description from MDR code lists into the gears type attribute.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} faObj - A reference to the Fishing activity object
     * @param {Array} data - An array containing the available gears
     * @alias addGearDescription
     */
    var addGearDescription = function(faObj){
        mdrCacheService.getCodeList('gear_type').then(function(response){
            angular.forEach(faObj.gears, function(item) {
                var mdrRec = _.findWhere(response, { code: item.type });
                if (angular.isDefined(mdrRec)) {
                    item.type = item.type + ' - ' + mdrRec.description;
                }
            });
        });
    };

    /**
     * Adds catch type description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias addCatchTypeDescription
     */
    var addCatchTypeDescription = function(faObj){
        mdrCacheService.getCodeList('fa_catch_type').then(function(response){
            angular.forEach(faObj.catches, function(item) {
                var mdrRec = _.findWhere(response, { code: item.details.catchType });
                if (angular.isDefined(mdrRec)) {
                    item.details.typeDesc = mdrRec.description;
                }
            });
        });
    };
    
    var addGearProblemDesc = function(obj){
        mdrCacheService.getCodeList('fa_gear_problem').then(function(response){
            angular.forEach(obj.gearShotRetrieval, function(item) {
                angular.forEach(item.gearProblems, function(prob){
                    var mdrRec = _.findWhere(response, { code: prob.type });
                    if (angular.isDefined(mdrRec)) {
                        prob.typeDesc = mdrRec.description;
                    }
                });
            });
        });
    };
    
    var addRecoveryDesc = function(obj){
        mdrCacheService.getCodeList('fa_gear_recovery').then(function(response){
            angular.forEach(obj.gearShotRetrieval, function(item) {
                angular.forEach(item.gearProblems, function(rec){
                    var mdrRec = _.findWhere(response, { code: rec.recoveryMeasure });
                    if (angular.isDefined(mdrRec)) {
                        rec.recoveryDesc = mdrRec.description;
                    }
                });
            });
        });
    };

	/**
     * Adds weight means description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias addWeightMeansDescription
     */
    var addWeightMeansDescription = function(faObj){
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

    var addVesselRoleDescription = function(faObj){
        mdrCacheService.getCodeList('vessel_role').then(function(response){
            angular.forEach(faObj.relocation, function(item) {
                var mdrRec = _.findWhere(response, { code: item.role });
                if (angular.isDefined(mdrRec)) {
                    item.roleDesc = mdrRec.description;
                }
            });
        });
    };

    /**
     * Loads the data to be presented in the fishing activity details panel
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the fishing activity details panel
     * @param {Array} attrOrder - An array with the order and configs about the attributes
     * @alias loadFishingActivityDetails
     * @returns {Object} data to be displayed
     */
    var loadFishingActivityDetails = function(data, attrOrder){
        var attrKeys = _.pluck(attrOrder, 'id');
        var finalSummary = {};

        if (_.keys(data).length) {
            finalSummary.items = [];
        }

        angular.forEach(data,function(value,key){
            if(angular.isObject(value) && !angular.isArray(value)){
                if(!_.isEmpty(value) && key !== 'characteristics'){
                    finalSummary.subItems = [];
                    angular.forEach(value,function(subItem,subKey){
                        var attrData = _.where(attrOrder, {id: subKey});
                        if(angular.isDefined(subItem) && !_.isNull(subItem) && subItem.length > 0 && attrData.length){
                            finalSummary.subItems.push(transformFaItem(subItem, subKey, attrOrder, attrKeys, attrData[0]));
                        }
                    });

                    if(!_.isEmpty(value)){
                        finalSummary.subTitle = locale.getString('activity.trip_' + key);
                    }
                }
            }else if(angular.isDefined(value) && !_.isNull(value) && value.length > 0){
                var attrData = _.where(attrOrder, {id: key});
                if(attrData.length){
                    finalSummary.items.push(transformFaItem(value, key, attrOrder, attrKeys, attrData[0]));
                }
            }
        });

        return finalSummary;
    };

    faServ.loadFaDetails = function(data, attrOrder){
        return loadFishingActivityDetails(data, attrOrder);
    };

    /**
     * Transform the FA item in order to be displayed
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Any} value - Field value
     * @param {String} key - Field key
     * @param {Array} attrOrder - Field attributes order
     * @param {Array} attrKeys - Field attribute keys
     * @alias transformFaItem
     * @returns {Object} item to be displayed in the fishing activity details
     */
    var transformFaItem = function(value, key, attrOrder, attrKeys, attrData){
        var newVal = value;

        if(attrData.type === 'date'){
            newVal = $filter('stDateUtc')(newVal);
        } else if (angular.isArray(value)) {
            newVal = '';
            angular.forEach(value, function(arrItem, arrIdx) {
                newVal += arrItem + ', ';
                if (value.length - 1 === arrIdx) {
                    newVal = newVal.slice(0, newVal.length - 3);
                }
            });
        }
        
        var itemLabel;
        if(key.indexOf(".") !== -1){
            itemLabel = key;
        }else{
            itemLabel = locale.getString('activity.fa_details_item_' + key);
        }

        return {
            idx: attrKeys.indexOf(key),
            label: itemLabel !== "%%KEY_NOT_FOUND%%" ? itemLabel : key,
            value: newVal,
            clickable: attrData.clickable || undefined
        };
    };

    /**
     * Loads the data to be presented in the report details
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the report details
     * @alias loadFaDocData
     * @returns {Object} data to be displayed
     */
    var loadFaDocData = function(data){
        var attrOrder = angular.copy(faDocAttrOrder);
        var relRepIdx = attrOrder.length;

        if(angular.isDefined(data.relatedReports) && data.relatedReports.length > 0){
            data.relatedReports = addExtraDetails(data.relatedReports,attrOrder,relRepIdx);
        }

        var finalSummary = loadFishingActivityDetails(data, attrOrder);

        finalSummary.title = locale.getString('activity.activity_report_doc_title');

        if (angular.isDefined(data.characteristics)) {
            finalSummary.characteristicsDetails = data.characteristics;
        }
        if (angular.isDefined(finalSummary.subItems)) {
            finalSummary.subTitle = locale.getString('activity.activity_related_flux_doc_title');
        }

        return finalSummary;
    };

    /**
     * Loads the data to be presented in the gears tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the gears tile
     * @alias loadGears
     * @returns {Object} data to be displayed
     */
    var loadGears = function(data){
        angular.forEach(data, function(gear){
            var gearAttrs = _.keys(gear);
            if (gearAttrs.length > 2) {
                gear.characteristics = {};
                var characteristicsDetails = {};
                angular.forEach(gearAttrs,function(attrName){
                    var nonCharacteristics = ['type','role'];
                    var mainCharacteristics = ['meshSize','lengthWidth','numberOfGears'];

                    if(nonCharacteristics.indexOf(attrName) === -1){
                        if(mainCharacteristics.indexOf(attrName) === -1){
                            characteristicsDetails[attrName] = gear[attrName];
                        }else{
                            gear.characteristics[attrName] = gear[attrName];
                        }
                        delete gear[attrName];
                    }
                });
                gear.characteristics = loadFishingActivityDetails(gear.characteristics, gearAttrOrder);
                gear.characteristics.characteristicsDetails = characteristicsDetails;
                gear.characteristics.title = locale.getString('activity.characteristics');
            }
        });

        var gears = data;
       
        return gears;
    };

    /**
     * Loads the data to be presented in the activity details tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {String} faType - Fishing activity type
     * @param {Object} data - A reference to the data to be loaded in the activity details tile
     * @alias loadSummaryData
     * @returns {Object} data to be displayed
     */
    var loadSummaryData = function(faType,data){
        var exceptions = ['arrival_notification', 'arrival_declaration'];
        var finalSummary;
        
        if(exceptions.indexOf(faType) === -1){
            finalSummary = loadFishingActivityDetails(data, faSummaryAttrsOrder);
            if (angular.isDefined(data.characteristics)) {
                finalSummary.characteristicsDetails = data.characteristics;
            }
            finalSummary.title = locale.getString('activity.title_fishing_activity') + ': ' + locale.getString('activity.fa_type_' + faType);
        }else{
            finalSummary = data;
        }

        return finalSummary;
    };

    /**
     * Loads the data to be presented in the area tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {String} faType - Fishing activity type
     * @param {Object} data - A reference to the data to be loaded in the area tile
     * @alias loadAreaData
     * @returns {Object} data to be displayed
     */
     var loadAreaData = function(faType, data) {
        var areaSummary = {
            areaData: {}
        };
        var wkt = new ol.format.WKT();
        areaSummary.title = locale.getString('activity.area_tile_' + faType);
        areaSummary.number = 12 / (Object.keys(data).length);

        angular.forEach(data, function(value, key) {
            areaSummary.areaData[key] = {};
            areaSummary.areaData[key].occurence = value.occurence;
            if (angular.isDefined(value.geometry)){
                var geom = wkt.readGeometry(value.geometry);
                var coords = geom.getCoordinates();
                areaSummary.areaData[key].long = coords[0];
                areaSummary.areaData[key].lat = coords[1];
                areaSummary.areaData[key].geometry = geom;
            }
        });
        return areaSummary;
    };

    /**
     * Loads the data to be presented in the catch tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the catch tile
     * @alias loadFishingData
     * @returns {Object} data to be displayed in the catch tile
     */
    var loadFishingData = function(data){
        if(angular.isDefined(data) && data.length){
            var classes = ['lsc','bms'];
            angular.forEach(data, function(item){
                angular.forEach(classes, function(className){
                    if(angular.isDefined(item[className].gears)){
                        item[className].gears = loadGears(item[className].gears);
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
        return data;
    };
    
    /**
     * Loads the data to be presented in the catch tile
     * 
     * @memberof fishingActivityService
     * @private
     * @alias loadGearShotRetrieval
     * @param {Object} data - A reference to the data to be loaded in the gear shot retrieval tile
     * @returns {Object} data to be displayed in the gear shot retrieval tile
     */
    var loadGearShotRetrieval = function(data){
        angular.forEach(data, function(record){
            record.location = [record.location];
            record.gears = loadGears([record.gear]);
            delete record.gear;
        });
        
        return data;
    };


    /**
     * Loads the data to be presented in the catch tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {String} obj - Fishing activity model
     * @param {Object} data - A reference to the data to be loaded in the catch tile
     * @alias loadTripDetails
     * @returns {Object} data to be displayed in the catch tile
     */
    var loadTripDetails = function(data){
        if(angular.isDefined(data)){
            data.vesselDetails.vesselOverview = {};

            var attrOrder = angular.copy(vesselAttrOrder);
            var vesselIdx = attrOrder.length;

            angular.forEach(data.vesselDetails,function(prop,propName){
                if(!_.isObject(prop)){
                    data.vesselDetails.vesselOverview[propName] = prop;
                }
            });

            if(angular.isDefined(data.vesselDetails.vesselIds) && data.vesselDetails.vesselIds.length){
                _.extend(data.vesselDetails.vesselOverview,addExtraDetails(data.vesselDetails.vesselIds,attrOrder,vesselIdx));
                delete data.vesselDetails.vesselIds;
            }

            if(_.keys(data.vesselDetails.vesselOverview).length){
                data.vesselDetails.vesselOverview = loadFishingActivityDetails(data.vesselDetails.vesselOverview, attrOrder);
            }

            if(angular.isDefined(data.vesselDetails.authorizations) && data.vesselDetails.authorizations.length){
                var authAttrOrder = [];
                data.vesselDetails.authorizations = addExtraDetails(data.vesselDetails.authorizations,authAttrOrder,0);
                data.vesselDetails.authorizations = loadFishingActivityDetails(data.vesselDetails.authorizations, authAttrOrder);
                data.vesselDetails.authorizations.title = locale.getString('activity.authorizations');
            }

            if(angular.isDefined(data.vesselDetails.contactParties) && data.vesselDetails.contactParties.length){
                angular.forEach(data.vesselDetails.contactParties, function(item) {
                    item.type = item.role + ' - ' + item.contactPerson.alias;
                });
            }

            if(angular.isDefined(data.vesselDetails.storage)){
                var storAttrOrder = [
                    {
                        idx: 0,
                        id: 'type',
                        type: 'string'
                    }
                ];

                if(angular.isDefined(data.vesselDetails.storage.identifiers) && data.vesselDetails.storage.identifiers.length){
                    var type = data.vesselDetails.storage.type;
                    data.vesselDetails.storage = addExtraDetails(data.vesselDetails.storage.identifiers,storAttrOrder,1);
                    data.vesselDetails.storage.type = type;
                }

                data.vesselDetails.storage = loadFishingActivityDetails(data.vesselDetails.storage, storAttrOrder);
                data.vesselDetails.storage.title = locale.getString('activity.vessel_storage');
            }
        }

        return data;
    };

    /**
     * Adds extra attributes to attrOrder
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the attrOrder
     * @param {Array} attrOrder - Array with the attribute order
     * @param {Number} attrIdx - Current index in the attrOrder
     * @alias addExtraDetails
     * @returns {Object} data to be displayed in the fa details panel
     */
    var addExtraDetails = function(data,attrOrder,attrIdx){
        var finalData = {};
        angular.forEach(data, function(value){
            finalData[value.schemeId] = value.id;

            attrOrder.push({
                idx: attrIdx,
                id: value.schemeId,
                type: 'string'
            });
            attrIdx++;
        });

        return finalData;
    };


    var loadRelocation = function(data){
        angular.forEach(data, function(row){
            angular.forEach(row.vesselIdentifiers, function(item){
                if(item.schemeId === 'IRCS'){
                    row.ircs = item.id;
                }else{
                    row.vesselId = item;
                }
            });
        });

        return data;
    };
    

    /**
     * Loads all the fishing activity data in the model
     * 
     * @memberof fishingActivityService
     * @public
     * @param {String} obj - Fishing activity model
     * @param {Object} data - A reference to the data to be loaded in the fishing activity view
     * @alias faFromJson
     * @returns {Object} data to be displayed in the fishing activity view
     */
    faServ.faFromJson = function(obj,data){
        var model = faModels.common.concat(angular.isDefined(faModels[obj.faType]) ? faModels[obj.faType] : []);

        angular.forEach(model, function(dataType) {
            switch (dataType) {
                case 'activityDetails':
                    obj.activityDetails = loadSummaryData(obj.faType, data.activityDetails);
                    break;
                case 'areas':
                    obj.areas = loadAreaData(obj.faType, data.areas);
                    break;
                case 'reportDetails':
                    obj.reportDetails = loadFaDocData(data.reportDetails);
                    break;
                case 'locations':
                    obj.locations = data.locations;
                    break;
                case 'gears':
                    obj.gears = loadGears(data.gears);
                    addGearDescription(obj);
                    break;
                case 'catches':
                    obj.catches = loadFishingData(data.catches);
                    addGearDescription(obj);
                    /*this.addCatchTypeDescription(obj);*/
                    addWeightMeansDescription(obj);
                    break;
                case 'tripDetails':
                    obj.tripDetails = loadTripDetails(data.tripDetails);
                    break;
                case 'processingProducts':
                    obj.processingProducts = data.processingProducts;
                    break;
                case 'relocation':
                    obj.relocation = loadRelocation(data.relocation);
                    addVesselRoleDescription(obj);
                    break;
                case 'gearShotRetrieval':
                    obj.gearShotRetrieval = loadGearShotRetrieval(data.gearShotRetrieval);
                    addGearProblemDesc(obj);
                    addRecoveryDesc(obj);
                    addGearDescription(obj);
                    break;
            }
        });

        return obj;
    };

    return faServ;
});
