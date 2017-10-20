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
 * @ngdoc controller
 * @name AdvancedsearchformCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service <p>{@link unionvmsWeb.activityService}</p>
 * @param unitConversionService {Service} The unit conversion service <p>{@link unionvmsWeb.visibilityService}</p>
 * @param mdrCacheService {Service} The mdr code lists cache service <p>{@link unionvmsWeb.mdrCacheService}</p>
 * @param vesselRestService {Service} The vessel REST service
 * @param userService {Service} The user service
 * @param locale {Service} The angular locale service
 * @param visibilityService {Service} The visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @attr {Boolean} isFormValid - A flag for validating the search form
 * @attr {Object} codeLists - An object containing all code lists items
 * @attr {Object} advancedSearchObject - An object containing all search criterias specified within the form
 * @description
 *  The controller for the advanced search form of the activity tab table  
 */
angular.module('unionvmsWeb').controller('AdvancedsearchformCtrl',function($scope, activityService, unitConversionService, mdrCacheService, vesselRestService, userService, locale, visibilityService){
    $scope.actServ = activityService;
    $scope.visServ = visibilityService;
    $scope.isFormVisible = true;
    $scope.isFormValid = true;
    
    $scope.visibleCombos = {
        reportType: true,
        activityType: true,
        gearType: true
    };
    
    $scope.codeLists = {
        comChannels: null,
        purposeCodes: null,
        reportTypes: null,
        gearTypes: null,
        activityTypes: null,
        weightUnits: [{code: 'kg', text: 'Kg'}, {code: 'TNE', text: 'Ton'}]
    };

    $scope.advancedSearchObject = {
        weightUnit: "kg", //by default is kg
        comChannel: undefined,
        fromId: undefined,
        onwer: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        vessel: undefined,
        vesselGroup: undefined,
        purposeCode: undefined,
        reportType: undefined,
        activityType: undefined,
        area: undefined,
        port: undefined,
        gearType: undefined,
        species: undefined,
        master: undefined,
        minWeight: undefined,
        maxWeight: undefined
    };
    
    /**
     * Get all available communication channels from Activity module
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getComChannels
     * @returns {Array} An array with all communication channels
     */
    $scope.getComChannels = function(){
        $scope.codeLists.comChannels = $scope.actServ.getCommChannelsData();
    };
    
    /**
     * Get all purpose codes and their human readable text from MDR
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getPurposeCodes
     * @returns {Array} An array with all purpose codes
     */
    $scope.getPurposeCodes = function(){
        $scope.codeLists.purposeCodes = [];
        mdrCacheService.getCodeList('FLUX_GP_PURPOSE').then(function(response){
             var list = convertCodelistToCombolist(response, false, false);
             if (!userService.isAllowed('SHOW_DELETED_FA_REPORTS', 'Activity', true)){
                 list = _.reject(list, function(item){
                     return item.code === '3';
                 });
             }
             
             angular.copy(list, $scope.actServ.allPurposeCodes); 
             
             $scope.advancedSearchObject.purposeCode = $scope.actServ.getAllPurposeCodesArray();
             
             $scope.actServ.reportsList.searchObject = {
                 multipleCriteria: {
                     'PURPOSE': $scope.advancedSearchObject.purposeCode
                 }
             };
             
             $scope.codeLists.purposeCodes = list;
             $scope.actServ.isGettingMdrCodes = false;
        }, function(error){
            //FIXME show other message
            $scope.actServ.setAlert(true, 'activity.activity_error_not_possible_to_query_activity_data');
            $scope.actServ.isGettingMdrCodes = false;
            $scope.isFormVisible = false; //When we don't have MDR purpose codes we will not be able to do activity queries, so we hide the search form
        });
    };
    
    /**
     * Get all report types from MDR
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getReportTypes
     * @returns {Array} An array with all report types
     */
    $scope.getReportTypes = function(){
        $scope.codeLists.reportTypes = [];
        mdrCacheService.getCodeList('FLUX_FA_REPORT_TYPE').then(function(response){
            $scope.codeLists.reportTypes = convertCodelistToCombolist(response, false, false);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.reportType = false;
        });
    };
    
    /**
     * Get all gear types from MDR
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getGearTypes
     * @returns {Array} An array with all gear types
     */
    $scope.getGearTypes = function(){
        $scope.codeLists.gearTypes = [];
        mdrCacheService.getCodeList('GEAR_TYPE').then(function(response){
            $scope.codeLists.gearTypes = convertCodelistToCombolist(response, true, false);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.gearType = false;
        });
    };
    
    /**
     * Get all activity types from MDR
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getActivityTypes
     * @returns {Array} An array with all activity types
     */
    $scope.getActivityTypes = function(){
        $scope.codeLists.activityTypes = [];
        mdrCacheService.getCodeList('FLUX_FA_TYPE').then(function(response){
            var suportedCodes = ['DEPARTURE', 'ARRIVAL', 'AREA_ENTRY', 'AREA_EXIT', 'FISHING_OPERATION', 'LANDING', 'DISCARD', 'TRANSHIPMENT', 'RELOCATION', 'JOINED_FISHING_OPERATION'];
            $scope.codeLists.activityTypes = convertCodelistToCombolist(response, true, true, suportedCodes);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.activityType = false;
        });
    };
    
    /**
     * Get the list of the user's vessel groups
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias getVesselGroups
     * @returns {Array} An array with all vessel groups that belong to a user
     */
    $scope.getVesselGroups = function(){
        $scope.vesselGroups = [];
        vesselRestService.getVesselGroupsForUser().then(function(response){
            angular.forEach(response, function(item) {
                $scope.vesselGroups.push({
            	    code: item.id,
            	    text: item.name
            	});
            });
        });
    };
    
    /**
     * Reset search form and clear table results
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias resetSearch
     */
    $scope.resetSearch = function(){
        var keys = _.keys($scope.advancedSearchObject);
        angular.forEach(keys, function(key) {
        	if (key === 'weightUnit'){
        	    $scope.advancedSearchObject.weightUnit = 'kg';
        	} else if (key === 'purposeCode'){
        	    $scope.advancedSearchObject[key] = $scope.actServ.getAllPurposeCodesArray();
        	} else {
        	    $scope.advancedSearchObject[key] = undefined;
        	}
        });
        $scope.actServ.resetReportsListTableState();
        $scope.actServ.resetReportsListSearchObject();
        $scope.actServ.reportsList.isLoading = true;
        $scope.actServ.getActivityList(function(){
            $scope.actServ.reportsList.fromForm = true;
            $scope.actServ.reportsList.stCtrl.pipe();
        });
    };
    
    /**
     * Search for FA reports using user search criteria defined in the search form
     * 
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias searchFAReports
     */
    $scope.searchFAReports = function(){
        $scope.isFormValid = false;
        if ($scope.activityAdvancedSearchForm.$valid){
            $scope.isFormValid = true;
            $scope.actServ.reportsList.isLoading = true;
            $scope.actServ.resetReportsListTableState();
            $scope.actServ.isTableLoaded = false;
            
            var keyMapper = {
                reportType: 'REPORT_TYPE',
                fromId: 'FROM',
                owner: 'OWNER',
                startDateTime: 'PERIOD_START',
                endDateTime: 'PERIOD_END',
                vesselGroup: 'VESSEL_GROUP',
                vessel: 'VESSEL',
                gearType: 'GEAR',
                species: 'SPECIES',
                master: 'MASTER',
                area: 'AREAS',
                port: 'PORT',
                minWeight: 'QUANTITY_MIN',
                maxWeight: 'QUANTITY_MAX',
                comChannel: 'SOURCE',
                activityType: 'ACTIVITY_TYPE'
            };
            
            //FIXME this is to be used in the future when we start having multiple criteria selection in the form
//            var multipleKeyMapper = {
//                purposeCode: 'PURPOSE',  
//            };
            
            var formatedSearch = {};
            angular.forEach($scope.advancedSearchObject, function(value, key) {
                if (key !== 'weightUnit' && key !== 'purposeCode' && (angular.isDefined(value) && value !== null && value !== '')){
                    if (key === 'startDateTime' || key === 'endDateTime'){
                        value = unitConversionService.date.convertDate(value, 'to_server');
                    } 
                    this[keyMapper[key]] = value;
                }
            }, formatedSearch);
            
            var multipleFormatedSearch = {
                'PURPOSE': $scope.advancedSearchObject.purposeCode
            };
            
            
            if (angular.isDefined(formatedSearch.QUANTITY_MIN) || angular.isDefined(formatedSearch.QUANTITY_MAX)){
                formatedSearch.WEIGHT_MEASURE = $scope.advancedSearchObject.weightUnit;
            }
            
            if (angular.isDefined(formatedSearch.QUANTITY_MAX) && !angular.isDefined(formatedSearch.QUANTITY_MIN)){
                formatedSearch.QUANTITY_MIN = 0;
            }
            
            $scope.actServ.reportsList.searchObject = {
                simpleCriteria: formatedSearch,
                multipleCriteria: multipleFormatedSearch
            };
            
            $scope.actServ.getActivityList(function(){
                $scope.actServ.reportsList.fromForm = true;
                $scope.actServ.reportsList.stCtrl.pipe();
            });
        }
    };
    
    /**
     * Update the fishing activities column visibility settings
     *  
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias updateVisibilityCache
     * @param {String} column - the column name property to be updated
     */
    $scope.updateVisibilityCache = function(column){
        $scope.visServ.updateStorage(column);
    };
    
    /**
     * Get the data for all comboboxes used in the the advanced search form
     * 
     * @memberof AdvancedsearchformCtrl
     * @private
     */
    function getComboboxData(){
        var lists = ['comChannels', 'purposeCodes', 'reportTypes', 'gearTypes', 'activityTypes', 'vesselGroups'];
        angular.forEach(lists, function(list) {
        	var fnName = 'get' + list.substring(0,1).toUpperCase() + list.substring(1);
        	$scope[fnName]();
        });
    }
    
    /**
     * Convert code lists array into combobox list array
     * 
     * @memberof AdvancedsearchformCtrl
     * @private
     * @param {Array} data - The input data array
     * @param {Boolean} withTooltip - True if the item text and tooltip description should be different
     * @parm {Boolean} useAbbreviations - Whether the item text should be fetched from the abbreviations lang file or not
     * @param {Array} [suportedCodes] - An array containing the supported codes. This param is optional
     * @returns {Array} An array suitable for combobox use
     */
    function convertCodelistToCombolist (data, withTooltip, useAbbreviations, suportedCodes){
        var comboList = [];
        angular.forEach(data, function(item) {
            if (item.code === 'JOINED_FISHING_OPERATION'){
                item.code = 'JOINT_FISHING_OPERATION';
            }
            var rec = {
                code: item.code,
                text: item.description
            };
            if (withTooltip){
                if (useAbbreviations){
                    rec.text = locale.getString('abbreviations.activity_' + item.code);
                } else {
                    rec.text = item.code;
                }
                
                rec.desc = item.description;
            }
            
            if (angular.isDefined(suportedCodes)){
                if (_.indexOf(suportedCodes, item.code) !== -1 || (item.code === 'JOINT_FISHING_OPERATION' && _.indexOf(suportedCodes, 'JOINED_FISHING_OPERATION') !== -1)){
                    comboList.push(rec);
                }
            } else {
                comboList.push(rec);
            }
        });
        
        return comboList;
    }
    
    /**
     * Initialization function
     * 
     * @memberof ActivityCtrl
     * @private
     */
    function init(){
        getComboboxData();
    }

    init();
});

