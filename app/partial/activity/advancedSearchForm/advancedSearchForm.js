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
 * @attr {Boolean} isFormValid - A flag for validating the search form
 * @attr {Object} codeLists - An object containing all code lists items
 * @attr {Object} advancedSearchObject - An object containing all search criterias specified within the form
 * @description
 *  The controller for the advanced search form of the activity tab table  
 */
angular.module('unionvmsWeb').controller('AdvancedsearchformCtrl',function($scope, activityService, unitConversionService, mdrCacheService, vesselRestService, userService){
    $scope.actServ = activityService;
    $scope.isFormValid = true;
    
    $scope.codeLists = {
        comChannels: null,
        purposeCodes: null,
        reportTypes: null,
        gearTypes: null,
        activityTypes: null,
        weightUnits: [{code: 'kg', text: 'Kg'}, {code: 't', text: 'Ton'}]
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
        //FIXME replace with proper service
        $scope.codeLists.comChannels =  [{code: 'FLUX', text: 'FLUX'}];
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
        mdrCacheService.getCodeList('flux_gp_purposecode').then(function(response){
             var list = convertCodelistToCombolist(response);
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
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
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
        mdrCacheService.getCodeList('flux_fa_report_type').then(function(response){
            $scope.codeLists.reportTypes = convertCodelistToCombolist(response);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
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
        mdrCacheService.getCodeList('gear_type').then(function(response){
            $scope.codeLists.gearTypes = convertCodelistToCombolist(response);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
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
        mdrCacheService.getCodeList('flux_fa_type').then(function(response){
            $scope.codeLists.activityTypes = convertCodelistToCombolist(response);
        }, function(error){
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
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
        $scope.actServ.getActivityList();
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
                if (key !== 'weightUnit' && key !== 'purposeCode' && (!angular.isDefined(value) || (value !== null && value !== ''))){
                    if (key === 'startDateTime' || key === 'endDateTime'){
                        value = unitConversionService.date.convertDate(value, 'to_server');
                    }
                    this[keyMapper[key]] = value;
                }
            }, formatedSearch);
            
            var multipleFormatedSearch = {
                'PURPOSE': $scope.advancedSearchObject.purposeCode
            };
            
            
            if (angular.isDefined(formatedSearch.QUNTITY_MIN) || angular.isDefined(formatedSearch.QUNTITY_MAX)){
                formatedSearch.WEIGHT_MEASURE = $scope.advancedSearchObject.weightUnit;
            }
            
            if (angular.isDefined(formatedSearch.QUNTITY_MAX) && !angular.isDefined(formatedSearch.QUNTITY_MIN)){
                formatedSearch.QUNTITY_MIN = 0;
            }
            
            $scope.actServ.reportsList.searchObject = {
                simpleCriteria: formatedSearch,
                multipleCriteria: multipleFormatedSearch
            };
            
            $scope.actServ.getActivityList();
        }
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
     * @returns {Array} An array suitable for combobox use
     */
    function convertCodelistToCombolist (data){
        var comboList = [];
        angular.forEach(data, function(item) {
            comboList.push({
                code: item.code,
                text: item.description
            });
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

