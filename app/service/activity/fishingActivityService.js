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
angular.module('unionvmsWeb').factory('fishingActivityService', function(activityRestService, loadingStatus, mdrCacheService, locale, $filter, $state, tripSummaryService, reportingNavigatorService, tripReportsTimeline, $compile, spatialHelperService, $modalStack) {

    var faServ = {
        activityData: {},
        id: undefined,
        isCorrection: false,
        documentType: undefined,
        activityType: undefined,
        openFromMap: undefined
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
            'catches',
            'processingProducts'
        ],
        landing: [
            'locations',
            'catches',
            'processingProducts'
        ],
        arrival_notification: [
            'locations',
            'catches',
            'processingProducts'
        ],
        arrival_declaration: [
            'locations',
            'gears'
        ],
        fishing_operation: [
            'locations',
            'gears',
            'catches',
            'processingProducts',
            'gearShotRetrieval'
        ],
        discard: [
            'locations',
            'catches',
            'processingProducts'
        ],
        joint_fishing_operation: [
            'locations',
            'gears',
            'catches',
            'processingProducts',
            'relocation',
            'vesselDetails',
            'gearProblems'
        ],
        relocation: [
            'locations',
            'catches',
            'processingProducts',
            'vesselDetails'
        ],
        transhipment: [
            'locations',
            'catches',
            'processingProducts',
            'vesselDetails'
        ],
        area_entry: [
            'areas',
            'catches',
            'processingProducts'
        ],
        area_exit: [
            'areas',
            'catches',
            'processingProducts'
        ]
    };

    //Configs of activity details attributes
    var faSummaryAttrsOrder = [
        {
            id: 'occurrence',
            type: 'date'
        },
        {
            id: 'reason',
            type: 'string'
        },
        {
            id: 'vesselActivity',
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
            id: 'speciesTarget',
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
        },
        {
            id: 'startDate',
            type: 'date'
        },
        {
            id: 'endDate',
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
            clickable: true,
            onClick: function(refId){
                var report = _.find(tripSummaryService.trip.reports, function(rep){
                    return refId === rep.faUniqueReportID;
                });

                faServ.resetActivity();
                faServ.id = report.id;
                faServ.isCorrection = report.corrections;
                faServ.documentType = report.documentType;
                tripReportsTimeline.setCurrentPreviousAndNextItem(report.id);
                var content = angular.element('fishing-activity-navigator');
                
                var scope = content.scope();
                $compile(content)(scope);
            }
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

    var faMdrReason=[
	    {
		    activityName: 'area_entry',
		    achronym: 'FA_REASON_ENTRY'
	    },
	    {
		    activityName: 'departure',
		    achronym: 'FA_REASON_DEPARTURE'
	    },
	    {
		    activityName: 'discard',
		    achronym: 'FA_REASON_DISCARD'
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
	    faServ.documentType = undefined;
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
            area_entry: 'areaEntry',
            area_exit: 'areaExit',
            arrival_declaration: 'arrival',
            arrival_notification: 'notification',
            fishing_operation: 'fishingoperation',
            joint_fishing_operation: 'jointfishingoperation'
        };
        
        return views[type.toLowerCase()] || type;
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
     * @param {Object} gearObj - A reference to the activity gear object
     * @alias addGearDescription
     */
    var addGearDescription = function(gearObj){
        mdrCacheService.getCodeList('GEAR_TYPE').then(function(response){
            angular.forEach(gearObj, function(item) {
                var mdrRec = _.findWhere(response, { code: item.type });
                if (angular.isDefined(mdrRec)) {
                    item.type = item.type + ' - ' + mdrRec.description.replace('- ', '');
                }
            });
        });
    };
    
    /**
     * Adds gear description from MDR code lists into the gears type attribute inside catches
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} faCatches - A reference to the activity catches object
     * @alias addGearDescription
     */
    var addGearDescFromCatches = function(faCatches){
        mdrCacheService.getCodeList('GEAR_TYPE').then(function(response){
            angular.forEach(faCatches, function(faCatch){
                var keys = ['BMS', 'LSC'];
                for (var j = 0; j < keys.length; j++){
                    if (angular.isDefined(faCatch.groupingDetails[keys[j]].gears) && faCatch.groupingDetails[keys[j]].gears.length > 0){
                        for (var i = 0; i < faCatch.groupingDetails[keys[j]].gears.length; i++){
                            var mdrRec = _.findWhere(response, { code:  faCatch.groupingDetails[keys[j]].gears[i].type});
                            if (angular.isDefined(mdrRec)) {
                                faCatch.groupingDetails[keys[j]].gears[i].type = faCatch.groupingDetails[keys[j]].gears[i].type + ' - ' + mdrRec.description.replace('- ', '');
                            }
                        }
                    }
                }
            });
        });
    };
    
    /**
     * Adds gear description from MDR code lists into the gears type attribute inside gear shot retrieval
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} gearShotObj - A reference to the activity gearShotRetrieval object
     * @alias addGearDescription
     */
    var addGearDescFromGearShotRetrieval = function(gearShotObj){
        mdrCacheService.getCodeList('GEAR_TYPE').then(function(response){
            angular.forEach(gearShotObj, function(gearShot){
                if (angular.isDefined(gearShot.gears) && gearShot.gears.length > 0){
                    for (var i = 0; i < gearShot.gears.length; i++){
                        var mdrRec = _.findWhere(response, { code: gearShot.gears[i].type });
                        if (angular.isDefined(mdrRec)) {
                            gearShot.gears[i].type = gearShot.gears[i].type + ' - ' + mdrRec.description.replace('- ', '');
                        }
                    }
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
        mdrCacheService.getCodeList('FA_CATCH_TYPE').then(function(response){
            angular.forEach(faObj.catches, function(item) {
                var mdrRec = _.findWhere(response, { code: item.details.catchType });
                if (angular.isDefined(mdrRec)) {
                    item.details.typeDesc = mdrRec.description;
                }
            });
        });
    };
    
    /**
     * Adds gear problem description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} obj - A reference to the Fishing activity object
     * @alias addGearProblemDesc
     */
    var addGearProblemDesc = function(obj){
        mdrCacheService.getCodeList('FA_GEAR_PROBLEM').then(function(response){
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
    
    /**
     * Adds gear recovery description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} obj - A reference to the Fishing activity object
     * @alias addRecoveryDesc
     */
    var addRecoveryDesc = function(obj){
        mdrCacheService.getCodeList('FA_GEAR_RECOVERY').then(function(response){
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
        mdrCacheService.getCodeList('WEIGHT_MEANS').then(function(response){
            var classes = ['LSC','BMS'];
            angular.forEach(faObj.catches, function(item) {
                angular.forEach(classes, function(className) {
                    if(angular.isDefined(item.groupingDetails[className].classProps)){
                        var mdrRec = _.findWhere(response, {code: item.groupingDetails[className].classProps.weightingMeans});
                        if (angular.isDefined(mdrRec)){
                            if(!angular.isDefined(item.groupingDetails[className].classDescs)){
                                item.groupingDetails[className].classDescs = {};
                            }
                            item.groupingDetails[className].classDescs.weightingMeansDesc = mdrRec.description;
                        }
                    }
                });
            });
        });
    };
   
    /**
     * Gets the name of the fishing activity panel.
     * 
     * @memberof fishingActivityService
     * @public
     * @alias getFaView
     * @param {String} type - fa activity type
     */
    faServ.getFaView = function(type) {
        var view = "";
        angular.forEach(type.split("_"), function(value) {
            value = $filter('capitalize')(value);
            view += value;
        });
        view = 'trip' + view + 'Panel';

        return view;
    };
    
    /**
     * Quit the fishing activiy panel and navigate to the previous view
     * 
     * @memberof fishingActivityService
     * @public
     * @alias quitFaView
     */
    faServ.quitFaView = function(){
        spatialHelperService.fromFAView = false;
        //TODO recheck this logic when we implement navigation from panel to subpanel (e.g. fishing op to catch details)
        if (faServ.openFromMap){
            reportingNavigatorService.goToView('liveViewPanel', 'mapPanel');
        } else {
            reportingNavigatorService.goToView('tripsPanel', 'tripSummary');
        }

        faServ.openFromMap = false;
    };
    
    /**
     * Adds gear recovery description from MDR code lists into the details object.
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} faObj - A reference to the Fishing activity object
     * @alias addVesselRoleDescription
     */
    var addVesselRoleDescription = function(faObj){
        mdrCacheService.getCodeList('FA_VESSEL_ROLE').then(function(response){
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
                if(!_.isEmpty(value) && key !== 'characteristics' && key !== 'authorizations'){
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
            itemLabel = locale.getString('activity.fa_details_item_' + key.toLowerCase());
        }

        return {
            idx: attrKeys.indexOf(key),
            label: itemLabel !== "%%KEY_NOT_FOUND%%" ? itemLabel : key,
            value: newVal,
            clickable: attrData.clickable || undefined,
            onClick: attrData.onClick || undefined,
            id: key
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
        var finalSummary = {};

        if(angular.isDefined(data)){
            var attrOrder = angular.copy(faDocAttrOrder);
            var relRepIdx = attrOrder.length;

            if(angular.isDefined(data.relatedReports) && data.relatedReports.length > 0){
                data.relatedReports = addExtraDetails(data.relatedReports,attrOrder,relRepIdx);
            }

            finalSummary = loadFishingActivityDetails(data, attrOrder);

            if (angular.isDefined(data.characteristics) && !_.isEmpty(data.characteristics)) {
                finalSummary.characteristics = data.characteristics;
            }
            if (angular.isDefined(finalSummary.subItems)) {
                finalSummary.subTitle = locale.getString('activity.activity_related_flux_doc_title');
            }
        }

        finalSummary.title = locale.getString('activity.activity_report_doc_title');

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
                gear.mainCharacteristics = {};
                var popupCharacteristics = {};
                angular.forEach(gearAttrs,function(attrName){
                    var nonCharacteristics = ['type','role'];
                    var mainCharacteristics = ['meshSize','lengthWidth','numberOfGears'];

                    if(nonCharacteristics.indexOf(attrName) === -1){
                        if(mainCharacteristics.indexOf(attrName) === -1){
                            popupCharacteristics[attrName] = gear[attrName];
                        }else{
                            gear.mainCharacteristics[attrName] = gear[attrName];
                        }
                        delete gear[attrName];
                    }
                });
                gear.mainCharacteristics = loadFishingActivityDetails(gear.mainCharacteristics, gearAttrOrder);
                if(!_.isEmpty(popupCharacteristics)){
                    gear.mainCharacteristics.characteristics = popupCharacteristics;
                }
                gear.mainCharacteristics.title = locale.getString('activity.characteristics');
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
            if (angular.isDefined(data.characteristics) && _.keys(data.characteristics).length) {
                finalSummary.characteristics = data.characteristics;
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
        if (angular.isDefined(data.schemeId) && angular.isDefined(data.id)){
            areaSummary.title += ' - ' + data.schemeId + ':' + data.id; 
        }
        delete data.schemeId;
        delete data.id;
        
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
            var classes = ['LSC','BMS'];
            angular.forEach(data, function(item){
                angular.forEach(classes, function(className){
                    var classDetails = item.groupingDetails;

                    if(angular.isDefined(classDetails[className].gears)){
                        classDetails[className].gears = loadGears(classDetails[className].gears);
                    }

                    classDetails[className].classProps = {};

                    if(angular.isDefined(classDetails[className].destinationLocation) && angular.isDefined(classDetails[className].destinationLocation[0])){
                        classDetails[className].destinationLocation = classDetails[className].destinationLocation[0].id + ' - ' + classDetails[className].destinationLocation[0].name + ', ' +
                            classDetails[className].destinationLocation[0].countryId;
                    }

                    angular.forEach(classDetails[className], function(attr,attrName){
                        if(!_.isObject(attr) && !_.isArray(attr) && ['weight','unit'].indexOf(attrName) === -1){
                            classDetails[className].classProps[attrName] = attr;
                            delete classDetails[className][attrName];
                        }
                    });

                    if(_.isEmpty(classDetails[className].classProps)){
                        delete classDetails[className].classProps;
                    }

                    if(!angular.isDefined(classDetails[className].weight)){
                        classDetails[className].weight = 0;
                    }
                    if(!angular.isDefined(classDetails[className].unit)){
                        classDetails[className].unit = 0;
                    }
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
            if(angular.isDefined(record.gear)){
                record.gears = loadGears([record.gear]);
                delete record.gear;
            }
            record.characteristics = loadCharacteristics(record.characteristics);
            record.gearProblems = loadGearProblem(record.gearProblems);
        });
        return data;
    };

    /**
     * Loads the data to be presented in the gear problems tile
     * 
     * @memberof fishingActivityService
     * @private
     * @alias loadGearProblem
     * @param {Object} data - A reference to the data to be loaded in the gear problems
     * @returns {Object} data to be displayed in the gear problems tile
     */
    var loadGearProblem = function(data){
            if(angular.isDefined(data)){
                angular.forEach(data, function(gearProb){
                    if(gearProb.location){
                        gearProb.location = [gearProb.location];
                    }
                });
            }
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
        if(angular.isDefined(data) && angular.isDefined(data.vesselDetails)){
            data.vesselDetails.authorizations = data.authorizations;
            loadVesselDetails(data.vesselDetails);
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

    /**
     * Loads the data to be presented in the relocation tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} data - A reference to the data to be loaded in the relocation tile
     * @alias loadRelocation
     * @returns {Object} data to be displayed in the relocation tile
     */
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
     * Loads the data to be presented in the vessel tile
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} vesselDetails - A reference to the data to be loaded in the vessel tile
     * @alias loadVesselDetails
     * @returns {Object} data to be displayed in the vessel tile
     */
    var loadVesselDetails = function(vesselDetails){
        if(vesselDetails){
            if(_.isObject(vesselDetails) && !_.isArray(vesselDetails)){
                vesselDetails = [vesselDetails];
            }

            angular.forEach(vesselDetails, function(vessel){
                vessel.vesselOverview = {};

                var attrOrder = angular.copy(vesselAttrOrder);
                var vesselIdx = attrOrder.length;

                angular.forEach(vessel,function(prop,propName){
                    if(!_.isObject(prop)){
                        vessel.vesselOverview[propName] = prop;
                    }
                });

                if(angular.isDefined(vessel.vesselIds) && vessel.vesselIds.length){
                    _.extend(vessel.vesselOverview,addExtraDetails(vessel.vesselIds,attrOrder,vesselIdx));
                    delete vessel.vesselIds;
                }

                if(_.keys(vessel.vesselOverview).length){
                    vessel.vesselOverview = loadFishingActivityDetails(vessel.vesselOverview, attrOrder);
                }

                if(angular.isDefined(vessel.authorizations) && vessel.authorizations.length){
                    var authAttrOrder = [];
                    vessel.authorizations = addExtraDetails(vessel.authorizations,authAttrOrder,0);
                    vessel.authorizations = loadFishingActivityDetails(vessel.authorizations, authAttrOrder);
                    vessel.authorizations.title = locale.getString('activity.authorizations');
                }else{
                    delete vessel.authorizations;
                }

                if(angular.isDefined(vessel.contactParties) && vessel.contactParties.length){
                    angular.forEach(vessel.contactParties, function(item) {
                        item.type = item.role + ' - ' + item.contactPerson.alias;
                    });
                }else{
                    delete vessel.contactParties;
                }

                if(angular.isDefined(vessel.storage)){
                    var storAttrOrder = [
                        {
                            idx: 0,
                            id: 'type',
                            type: 'string'
                        }
                    ];

                    if(angular.isDefined(vessel.storage.identifiers) && vessel.storage.identifiers.length){
                        var type = vessel.storage.type;
                        vessel.storage = addExtraDetails(vessel.storage.identifiers,storAttrOrder,1);
                        vessel.storage.type = type;
                    }

                    vessel.storage = loadFishingActivityDetails(vessel.storage, storAttrOrder);
                    vessel.storage.title = locale.getString('activity.vessel_storage');
                }

                if(angular.isDefined(vessel.country) || angular.isDefined(vessel.name)){
                    if(angular.isDefined(vessel.country) && angular.isDefined(vessel.name)){
                        vessel.type = vessel.country + ' - ' + vessel.name;
                    }else{
                        vessel.type = angular.isDefined(vessel.country) ? vessel.country : vessel.name;
                    }
                }
                
            });

            return vesselDetails;
        }else{
            return undefined;
        }
    };

    /**
     * Loads the characteristics data to be presented
     * 
     * @memberof fishingActivityService
     * @private
     * @param {Object} characteristics - A reference to the characteristics to be loaded
     * @alias loadCharacteristics
     * @returns {Object} characteristics data to be displayed
     */
    var loadCharacteristics = function(characteristics){
        if(angular.isDefined(characteristics)){
            angular.forEach(characteristics, function(property, propName){
                var patt = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;
                if(patt.test(property)){
                    characteristics[propName] = $filter('stDateUtc')(property);
                }
            },characteristics);
        }

        return characteristics;
    };

     /**
     * Get the human readable text from MDR for Purpose code in report Details
     * 
     * @memberof fishingActivityService
     * @private
     * @alias getPurposeCodes
     * @returns the purpose code
     */
     var getPurposeCodes = function(acronym, obj){
        loadingStatus.isLoading('FishingActivity', true);
        
        mdrCacheService.getCodeList(acronym).then(function(response){
            angular.forEach(obj.reportDetails.items,function(item){
                if(item.id === "purposeCode"){
                    var purposeCode = _.where(response, {code: item.value});
                    if(angular.isDefined(purposeCode) && purposeCode.length > 0){
                        item.value = item.value +' - '+ purposeCode[0].description; 
                    }
                }
            });

            loadingStatus.isLoading('FishingActivity', false);  
        },function(error) {
               //TODO deal with error from rest service
               loadingStatus.isLoading('FishingActivity', false);
        });
     };

     /**
     * Get the human readable text from MDR for reason in activity details
     * 
     * @memberof fishingActivityService
     * @private
     * @alias getReasonCodes
     * @returns the purpose code
     */
     var getReasonCodes = function(obj){
        var activityType = _.where(faMdrReason, {activityName: obj.faType});
        
        if(angular.isDefined(activityType) && activityType.length > 0){
            var acronym =activityType[0].achronym;
            loadingStatus.isLoading('FishingActivity', true);
            
            mdrCacheService.getCodeList(acronym).then(function(response){
                angular.forEach(obj.activityDetails.items,function(item){
                    var reasonDesc = _.where(response, {code: item.value});
                    if(item.id === "reason"){
                        if(angular.isDefined(reasonDesc) && reasonDesc.length > 0){  
                            item.value = item.value +' - '+reasonDesc[0].description; 
                        }
                    }
                });

                loadingStatus.isLoading('FishingActivity', false);
            },function(error){
                //TODO deal with error from rest service
                loadingStatus.isLoading('FishingActivity', false);
            });
        }
    };

    /**
     * The click location callback function
     * 
     * @memberof fishingActivityService
     * @public
     * @alias locationClickCallback
     */
    faServ.locationClickCallback = function() {
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        spatialHelperService.fromFAView = true;
        $modalStack.dismissAll();
        angular.element('body').removeClass('modal-open');

        reportingNavigatorService.goToView('liveViewPanel', 'mapPanel');
    };

    /**
      * Check if a location tile should be clickable taking into consideration the route and the report configuration
      * 
      * @memberof fishingActivityService
      * @public
      * @alias isLocationClickable
      * @returns {Boolean} Whether the location tile should be clickable or not
      */
    faServ.isLocationClickable = function() {
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && tripSummaryService.withMap) {
            clickable = true;
        }

        return clickable;
    };

    var centerText = function (doc, text) {
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(textOffset, 20, text);
    };

    /*var writeFooter = function (doc) {
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(0, 10, moment().utc().format('YYYY-MM-DD HH:mm Z') + ' UTC');
        doc.text(0, 10, locale.getString('spatial.map_export_copyright') + ' unionVMS');
    };*/

    faServ.printView = function (view) {
        var viewContainer;
        if(view === 'fishingActivityPanel'){
            viewContainer = angular.element('.fa-partial');
        }
        
        var doc = new jsPDF('l', 'pt', 'a4');
    
        doc.setTextColor(41, 128, 185);
        doc.setFontSize(18);

        var options = {
            pagesplit: true
        };

        doc.addHTML(viewContainer,0,30,options,function(){
            centerText(doc, locale.getString('activity.title_fishing_activity'));
            //Add footer
            /*writeFooter(doc, 'landscape');*/
            doc.save("test.pdf");
        });
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
        
        if (obj.faType === 'transhipment' && angular.isDefined(data.activityDetails.authorizations)){
            if (data.activityDetails.authorizations.length > 0){
                var authAttrOrder = [];
                obj.activityAuthorizations = addExtraDetails([data.activityDetails.authorizations],authAttrOrder,0);
                obj.activityAuthorizations = loadFishingActivityDetails(obj.activityAuthorizations, authAttrOrder);
                obj.activityAuthorizations.title = locale.getString('activity.authorizations');
            } else {
                obj.activityAuthorizations = {
                    title: locale.getString('activity.authorizations')
                };
            }
            delete data.activityDetails.authorizations;
        }

        angular.forEach(model, function(dataType) {
            switch (dataType) {
                case 'activityDetails':
                    obj.activityDetails = loadSummaryData(obj.faType, data.activityDetails);
                    getReasonCodes(obj);
                    break;
                case 'areas':
                    obj.areas = loadAreaData(obj.faType, data.areas);
                    break;
                case 'reportDetails':
                    obj.reportDetails = loadFaDocData(data.reportDetails);
                    getPurposeCodes('FLUX_GP_PURPOSE',obj);                  
                    break;
                case 'locations':
                    obj.locations = data.locations;
                    break;
                case 'gears':
                    obj.gears = loadGears(data.gears);
                    addGearDescription(obj.gears);
                    break;
                case 'catches':
                    obj.catches = loadFishingData(data.catches);
                    addGearDescFromCatches(obj.catches);
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
                    obj.relocation = loadRelocation(data.relocations);
                    addVesselRoleDescription(obj);
                    break;
                case 'gearShotRetrieval':
                    obj.gearShotRetrieval = loadGearShotRetrieval(data.gearShotRetrievalList);
                    addGearProblemDesc(obj);
                    addGearDescFromGearShotRetrieval(obj.gearShotRetrieval);
                    break;
                case 'gearProblems':
                    obj.gearProblems = loadGearProblem(data.gearProblems);
                    addGearProblemDesc(obj);
                    break;
                case 'vesselDetails':
                    obj.vesselDetails = loadVesselDetails(data.vesselDetails);
                    break;
            }
        });

        return obj;
    };

    return faServ;
});
