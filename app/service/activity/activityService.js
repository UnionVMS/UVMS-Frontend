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
 * @name activityService
 * @param locale {Service} angular locale service
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param visibilityService {Service} the visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @param breadcrumbService {Service} the navigator breadcrumb service <p>{@link unionvmsWeb.breadcrumbService}</p>
 * @param fishingActivityService {Service} the fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @attr {Array} breadcrumbPages - An ordered array containing all possible values for the breadcrumb
 * @attr {Array} activities - An array containing the list of fishing activities reports
 * @attr {Array} displayedActivities - An array that is a copy of the activities array and is used in the smart tables
 * @attr {Array} history - An array containing the history list of a fishing activity report
 * @attr {Array} displayedHistory - An array that is a copy of the history array and is used in the smart tables
 * @attr {Object} overview - An object containing the data to be displayed at the activity overview partial
 * @attr {Object} tripsList - An object containing the state of the FA reports table such as pagination, sorting, smart table tableState
 * @attr {Object} reportsList - An object containing the state of the FA reports table such as pagination, sorting, smart table tableState
 * @attr {Object} historyList - An object containing the state of the FA history table
 * @attr {Array} allPurposeCodes - An array containing all purpose codes available to the user
 * @attr {Object} alert - An object to control alert messages
 * @description
 *  A service to deal with all activity data
 */
angular.module('unionvmsWeb').factory('activityService',function(locale, activityRestService, visibilityService, breadcrumbService, fishingActivityService) {
    var actServ = {};
    var pageSize = 25;
    var tableNames = ['reportsList','tripsList'];
    
    actServ.breadcrumbPages = [{
        title: 'activity.breadcrumb_reports_list',
        type: 'activities',
        visible: true
    },{
        title: 'activity.breadcrumb_report_history',
        type: 'history',
        visible: false
    },{
        title: 'activity.breadcrumb_report_hist_activity_list',
        type: 'activitiesHistory',
        visible: false
    },{
        title: 'activity.breadcrumb_report_trip_summary',
        type: 'tripSummary',
        visible: false
    },{
        title: 'activity.breadcrumb_report_catch_details',
        type: 'catchDetails',
        visible: false
    },{
        title: 'activity.breadcrumb_report_details',
        type: 'details',
        visible: false
    },{
        title: 'activity.breadcrumb_report_catch_evolution',
        type: 'catchEvolution',
        visible: false
    },{
        title: 'Trip Activity Details',
        type: 'tripActivityDetails',
        visible: false
    }];
    
    actServ.alert= {
        hasError: false,
        msg: undefined
    };
    
    actServ.activities = [];
    actServ.displayedActivities = [];
    actServ.trips = [];
    actServ.displayedTrips = [];
    actServ.overview = {};
    actServ.history = [];
    actServ.displayedHistory = [];
    actServ.selReportDoc = {};
    actServ.activitiesHistory = [];
    actServ.displayedActivitiesHistory = [];
    
    actServ.reportsList = getListObject();
    actServ.tripsList = getListObject();
    actServ.historyList = getHistoryListObject();
    actServ.activitiesHistoryList = getActivitiesHistoryListObject();
    
    actServ.allPurposeCodes = [];
    actServ.isGettingMdrCodes = false;
    
    /**
     * Create an empty reportsList Object with all the necessary properties
     * 
     * @memberof activityService
     * @private
     * @returns {Object} The reportsList object
     */
    function getListObject(){
        return {
            isLoading: false,
            hasError: false,
            searchObject: {},
            tableState: undefined,
            stCtrl: undefined,
            fromForm: false,
            pagination: {
                offset: 0,
                pageSize: pageSize,
                totalPages: undefined
            },
            sorting: {
                sortBy: undefined,
                reversed: undefined
            }
        };
    }
    
    /**
     * Create an empty historyList object
     * 
     * @memberof activityService
     * @private
     * @returns {Object} The historyList object
     */
    function getHistoryListObject(){
        return {
            isLoading: false,
            hasError: false,
            pagination: {
                pageSize: pageSize
            }
        };
    }
    
    /**
     * Create an empty activitiesHistoryList object
     * 
     * @memberof activityService
     * @private
     * @returns {Object} The activitiesHistoryList object
     */
    function getActivitiesHistoryListObject(){
        return {
            isLoading: false,
            hasError: false
        };
    }
    
    /**
     * Reset the pagination and tableState properties of the reportsList object
     * 
     * @memberof activityService
     * @public
     * @alias resetListTableStates
     */
    actServ.resetListTableStates = function(){
        
        angular.forEach(tableNames, function(name){
            if (angular.isDefined(actServ[name].tableState)){
                actServ[name].tableState.pagination.start = 0;
            }
             
            actServ[name].pagination = {
                offset: 0,
                pageSize: pageSize,
                totalPages: undefined
            };
        });
        
    };
    
    /**
     * Reset attributes of the activity service (includes activities, overview and reportsList
     * 
     * @memberof activityService
     * @public
     * @alias reset
     * @param {Boolean} goToInitialPage - Whether the visualized page should be reset to the initial starting page
     */
    actServ.reset = function(goToInitialPage){
        this.activities = [];
        this.displayedActivities = [];
        this.trips = [];
        this.displayedTrips = [];
        this.overview = {};
        this.history = [];
        this.displayedHistory = [];
        this.activitiesHistory = [];
        this.displayedActivitiesHistory = [];
        this.tripsList = getListObject();
        this.reportsList = getListObject();
        this.historyList = getHistoryListObject();
        this.selReportDoc = {};
        this.activitiesHistoryList = getActivitiesHistoryListObject();
        this.allPurposeCodes = [];
        
        this.isTableLoaded = false;
        this.isGettingMdrCodes = false;
        
        if (angular.isDefined(goToInitialPage) && goToInitialPage){
            breadcrumbService.goToItem(0);
        }
    };
    
    /**
     * Clear attribute of the activity service by its type. Type can be: <b>activities</b>, <b>overview</b>, 
     * <b>history</b>, <b>activitiesHistory</b>
     * 
     * @memberof activityService
     * @public
     * @alias clearAttributeByType
     */
    actServ.clearAttributeByType = function(type){
        if (this[type] instanceof Array){
            this[type] = [];
            switch (type) {
                case 'activities':
                    this.displayedActivities = [];
                    this.displayedTrips = [];
                    break;
                case 'history':
                    this.displayedHistory = [];
                    break;
                case 'activitiesHistory':
                    this.displayedActivitiesHistory = [];
                    this.selReportDoc = {};
                    break;
                default:
                    break;
            }
        } else {
            if (type === 'details'){
                fishingActivityService.resetActivity();
            } else {
                this[type] = {};
            }
        }
    };
    
    /**
     * Get proper pagination object to be sent to the server while requesting for FA reports
     * 
     * @memberof activityService
     * @private
     * @param {Object} [tableState] - the smart table state object
     * @returns {Object} A pagination object with offset and pageSize
     */
    function getPaginationForServer(tableState){
        var pag = {
            offset: 0, 
            pageSize: pageSize
        };
        
        if (angular.isDefined(tableState) && tableState.pagination.start > 0){
            pag.offset = tableState.pagination.start;
        }
        
        return pag;
    }
    
    
    /**
     * Reset the lists search object
     * 
     * @memberof activityService
     * @public
     * @alias resetListSearchObject
     */
    actServ.resetListSearchObject = function(){
        //angular.forEach(tableNames, function(name){
            actServ.reportsList.searchObject = actServ.tripsList.searchObject = {
                multipleCriteria: {
                    'PURPOSE': actServ.getAllPurposeCodesArray()
                }
            };
       // });
    };
	
    /**
     * A property to avoid automatic reloading of the table through the st-pipe, mainly used to avoid reloading data
     * when coming back from activity details or activity history
     */
    actServ.isTableLoaded = false;
    /**
     * Get the list of activities according to the table pagination and search criteria
     * 
     * @memberof activityService
     * @public
     * @alias getActivityList
     * @param {Object} searcObj - The object containing the search criteria to filter FA reports
     */    
    actServ.getActivityList = function(callback, tableState, listName){
        actServ.clearAttributeByType('activities');
        
        var simpleCriteria = {};
        if (angular.isDefined(actServ[listName].searchObject.simpleCriteria)){
            simpleCriteria = actServ[listName].searchObject.simpleCriteria;
        }
        
        var payload = {
            pagination: getPaginationForServer(tableState),
            sorting: actServ[listName].sorting,
            searchCriteriaMap: simpleCriteria,
            searchCriteriaMapMultipleValues: actServ[listName].searchObject.multipleCriteria
        };

        var serviceName;
        var arrName;
        var displayedArrName;
        if(listName === 'reportsList'){
            serviceName = 'getActivityList';
            arrName = 'activities';
            displayedArrName = 'displayedActivities';
        }else{
            serviceName = 'getTripsList';
            arrName = 'trips';
            displayedArrName = 'displayedTrips';
            //FIXME
            payload.pagination = payload.sorting = {};
        }
        
        activityRestService[serviceName](payload).then(function(response){
            if (response.totalItemsCount !== 0){
                actServ[listName].pagination.totalPages = Math.ceil(response.totalItemsCount / pageSize);
            }
            
            actServ[arrName] = response.resultList;
            actServ[displayedArrName] = [].concat(actServ[arrName]);
            if (angular.isDefined(callback)){
                if (angular.isDefined(tableState)){
                    callback(tableState, listName);
                } else {
                    callback(undefined, listName);
                }
                
            }
            
            if (!angular.isDefined(callback) && angular.isDefined(actServ[listName].tableState)){
                actServ[listName].tableState.pagination.numberOfPages = actServ[listName].pagination.totalPages; 
            }
            
            actServ[listName].isLoading = false;
            actServ[listName].hasError = false;
            actServ.isTableLoaded = true;
        }, function(error){
            actServ[listName].isLoading = false;
            actServ[listName].hasError = true;
            actServ.isTableLoaded = false;
        });

    };
    
    /**
     * Get the user preferences for the activity
     * 
     * @memberof activityService
     * @public
     * @alias getUserPreferences
     */
    actServ.getUserPreferences = function(){
        activityRestService.getUserPreferences().then(function(response){
            var visibilitySettings = {
                fishingActivities: {
                    table: {
                        values: response.fishingActivityConfig.summaryReport.values,
                        order: response.fishingActivityConfig.summaryReport.order
                    }
                }
            };
            visibilityService.setVisibility(visibilitySettings);
        });
    };
    
    /**
     * Get the history for the current selected overview FA report
     * 
     * @memberof activityService
     * @public
     * @alias getHistory
     */
    actServ.getHistory = function(){
        actServ.historyList.isLoading = true;
        activityRestService.getReportHistory(actServ.overview.fluxReportReferenceId, actServ.overview.fluxReportReferenceSchemeId).then(function(response){
            actServ.historyList.isLoading = false;
            actServ.history = response;
            actServ.displayedHistory = [].concat(actServ.history);
        }, function(error){
            actServ.historyList.isLoading = false;
            actServ.historyList.hasError = true;
        });
    };
    
    /**
     * Get an array with all codes from the MDR Purpose Code list
     * 
     * @memberof activityService
     * @public
     * @alias getAllPurposeCodesArray
     * @returns {Array} An array with all MDR purpose codes
     */
    actServ.getAllPurposeCodesArray = function(){
        var arr = _.map(actServ.allPurposeCodes, function(item){
            return item.code;
        });
        
        return arr;
    };
    
    /**
     * Get activities history from a fishing activity report document
     * 
     * @memberof activityService
     * @public
     * @alias getActivitiesHistory
     * @param {Object} reportDoc - The fa report document for which activities will be fetched
     * @returns {Promise} A promise that is either resolved with a list of activities or rejected with the corresponding error
     */
    actServ.getActivitiesHistory = function(reportDoc){
        actServ.clearAttributeByType('activitiesHistory');
        actServ.selReportDoc = reportDoc;
        
        var payload = {
            pagination: {
                offset: 0,
                pageSize: 100
            },
            sorting: {
                reversed: true,
                sortBy: 'ACTIVITY_TYPE'
            },
            searchCriteriaMap: {
                'FA_REPORT_ID': reportDoc.id
            },
            searchCriteriaMapMultipleValues: {
                'PURPOSE': actServ.getAllPurposeCodesArray()
            }
        };
        
        activityRestService.getActivityList(payload).then(function(response){
            actServ.activitiesHistory = response.resultList;
            actServ.displayedActivitiesHistory = [].concat(actServ.activitiesHistory);
            actServ.activitiesHistoryList.isLoading = false;
        }, function(error){
            actServ.activitiesHistoryList.isLoading = false;
            actServ.activitiesHistoryList.hasError = true;
        });
    };
    
    /**
     * Set the activity service alert object properties
     * 
     * @memberof activityService
     * @public
     * @alias setAlert
     * @param {Boolean} hasError - If the alert has an error or not
     * @param {String} message - The internationalization code of message that will be used in the alert (e.g. activity.activity_list) 
     */
    actServ.setAlert = function(hasError, message){
        actServ.alert.hasError = hasError;
        actServ.alert.msg = message;
    };

	return actServ;
});
