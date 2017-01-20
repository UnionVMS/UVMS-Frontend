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
 * @attr {Array} breadcrumbPages - An ordered array containing all possible values for the breadcrumb
 * @attr {Array} activities - An array containing the list of fishing activities reports
 * @attr {Array} displayedActivities - An array that is a copy of the activities array and is used in the smart tables
 * @attr {Array} history - An array containing the history list of a fishing activity report
 * @attr {Array} displayedHistory - An array that is a copy of the history array and is used in the smart tables
 * @attr {Object} overview - An object containing the data to be displayed at the activity overview partial
 * @attr {Object} details - An object containing the data to be displayed at the activity details partial
 * @attr {Object} reportsList - An object containing the state of the FA reports table such as pagination, sorting, smart table tableState
 * @attr {Object} historyList - An object containing the state of the FA history table
 * @attr {Array} allPurposeCodes - An array containing all purpose codes available to the user
 * @description
 *  A service to deal with all activity data
 */
angular.module('unionvmsWeb').factory('activityService',function(locale, activityRestService, visibilityService, breadcrumbService) {
    var actServ = {};
    var pageSize = 25;
    
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
        title: 'activity.breadcrumb_report_details',
        type: 'details',
        visible: false
    }];
    
    actServ.activities = [];
    actServ.displayedActivities = [];
    actServ.overview = {};
    actServ.history = [];
    actServ.displayedHistory = [];
    actServ.details = {};
    actServ.activitiesHistory = [];
    actServ.displayedActivitiesHistory = [];
    
    actServ.reportsList = getReportsListObject();
    actServ.historyList = getHistoryListObject();
    actServ.activitiesHistoryList = getActivitiesHistoryListObject();
    
    actServ.allPurposeCodes = [];
    
    /**
     * Create an empty reportsList Object with all the necessary properties
     * 
     * @memberof activityService
     * @private
     * @returns {Object} The reportsList object
     */
    function getReportsListObject(){
        return {
            isLoading: false,
            hasError: false,
            searchObject: {},
            tableState: undefined,
            pagination: {
                offset: 1,
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
     * @alias resetReportsListTableState
     */
    actServ.resetReportsListTableState = function(){
        actServ.reportsList.pagination = {
            offset: 1,
            pageSize: pageSize,
            totalPages: undefined
        };
    };
    
    /**
     * Reset attributes of the activity service (includes activities, overview, details and reportsList
     * 
     * @memberof activityService
     * @public
     * @alias reset
     * @param {Boolean} goToInitialPage - Whether the visualized page should be reset to the initial starting page
     */
    actServ.reset = function(goToInitialPage){
        this.activities = [];
        this.displayedActivities = [];
        this.overview = {};
        this.history = [];
        this.displayedHistory = [];
        this.details = {};
        this.activitiesHistory = [];
        this.displayedActivitiesHistory = [];
        this.reportsList = getReportsListObject();
        this.historyList = getHistoryListObject();
        this.activitiesHistoryList = getActivitiesHistoryListObject();
        this.allPurposeCodes = [];
        
        if (angular.isDefined(goToInitialPage) && goToInitialPage){
            breadcrumbService.goToItem(0);
        }
    };
    
    /**
     * Clear attribute of the activity service by its type. Type can be: <b>activities</b>, <b>overview</b>, <b>details</b>, 
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
                    break;
                case 'history':
                    this.displayedHistory = [];
                    break;
                case 'activitiesHistory':
                    this.displayedActivitiesHistory = [];
                    break;
                default:
                    break;
            }
        } else {
            this[type] = {};
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
            offset: tableState ? tableState.pagination.start : 0,
            pageSize: pageSize
        };
        
        //FIXME remove the following ifelse block when server side pagination is fixed
        if(angular.isDefined(tableState)){
            pag.offset = tableState.pagination.start / tableState.pagination.number + 1;
        } else {
            pag.offset = 1;
        }
         
        return pag;
    }
    
    
    /**
     * Reset the reports list search object
     * 
     * @memberof activityService
     * @public
     * @alias resetReportsListSearchObject
     */
    actServ.resetReportsListSearchObject = function(){
        actServ.reportsList.searchObject = {
            multipleCriteria: {
                'PURPOSE': actServ.getAllPurposeCodesArray()
            }
        };
    };
	
    /**
     * Get the list of activities according to the table pagination and search criteria
     * 
     * @memberof activityService
     * @public
     * @alias getActivityList
     * @param {Object} searcObj - The object containing the search criteria to filter FA reports
     */
    actServ.getActivityList = function(callback, tableState){
        actServ.clearAttributeByType('activities');
        
        var payload = {
            pagination: getPaginationForServer(tableState),
            sorting: actServ.reportsList.sorting,
            searchCriteriaMap: actServ.reportsList.searchObject.simpleCriteria,
            searchCriteriaMapMultipleValues: actServ.reportsList.searchObject.multipleCriteria
        };
        
        activityRestService.getActivityList(payload).then(function(response){
            if (response.totalItemsCount !== 0){
                actServ.reportsList.pagination.totalPages = Math.ceil(response.totalItemsCount / pageSize);
            }
            
            actServ.activities = response.resultList;
            actServ.displayedActivities = [].concat(actServ.activities);
            if (angular.isDefined(callback) && angular.isDefined(tableState)){
                callback(tableState);
            }
            
            if (!angular.isDefined(callback) && angular.isDefined(actServ.reportsList.tableState)){
                actServ.reportsList.tableState.pagination.numberOfPages = actServ.reportsList.pagination.totalPages; 
            }
            
            actServ.reportsList.isLoading = false;
        }, function(error){
            actServ.reportsList.isLoading = false;
            actServ.reportsList.hasError = true;
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
    
    actServ.getAllPurposeCodesArray = function(){
        var arr = _.map(actServ.allPurposeCodes, function(item){
            return item.code;
        });
        
        return arr;
    };
    
    actServ.getActivitiesHistory = function(id){
        actServ.clearAttributeByType('activitiesHistory');
        
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
                'FA_REPORT_ID': id
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

	return actServ;
});
