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
angular.module('unionvmsWeb').factory('fishingActivityService', function (activityRestService, loadingStatus, mdrCacheService, locale) {

    var faServ = {
        activityData: {},
        id: undefined,
        isCorrection: false
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
        activityRestService.getFishingActivityDetails(obj.constructor.name.toLowerCase()).then(function (response) {
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
    faServ.loadFishingActivityDetails = function(data, attrOrder, subAttrOrder){
        var finalSummary = {};

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

    faServ.loadFaDocData = function(data){
        var attrOrder = ['type','dateAccepted'];
        var subAttrOrder = ['id','refId','creationDate','purposeCode',/*'owner',*/'purpose','FMC_marker'];

        var finalSummary = this.loadFishingActivityDetails(data, attrOrder, subAttrOrder);

        finalSummary.title = locale.getString('activity.activity_report_doc_title');
        finalSummary.subTitle = locale.getString('activity.activity_related_flux_doc_title');

        return finalSummary;
    };
    
	return faServ;
});
