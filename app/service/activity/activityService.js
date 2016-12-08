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
 * @description
 *  A service to deal with all activity data
 */
angular.module('unionvmsWeb').factory('activityService',function(locale, activityRestService, visibilityService, breadcrumbService) {
    var actServ = {};
    var listSize = 25;
    
    actServ.breadcrumbPages = [{
        title: 'activity.breadcrumb_reports_list',
        type: 'activities',
        visible: true
    },{
        title: 'activity.breadcrumb_report_overview',
        type: 'overview',
        visible: false
    },{
        title: 'activity.breadcrumb_report_details',
        type: 'details',
        visible: false
    }];
    
    actServ.activities = [];
    actServ.displayedActivities = [];
    actServ.overview = {};
    actServ.history= [];
    actServ.displayedHistory = [];
    actServ.details = {};
    
    actServ.reportsList = getReportsListObject();
    actServ.historyList = getHistoryListObject();
    
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
                page: 1,
                listSize: listSize,
                totalPageCount: undefined
            },
            sorting: {
                field: undefined,
                reverse: undefined,
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
                listSize: listSize
            }
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
            page: 1,
            listSize: listSize,
            totalPageCount: undefined
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
        this.reportsList = getReportsListObject();
        this.historyList = getHistoryListObject();
        
        if (angular.isDefined(goToInitialPage) && goToInitialPage){
            breadcrumbService.goToItem(0);
        }
    };
    
    /**
     * Clear attribute of the activity service by its type. Type can be: <b>activities</b>, <b>overview</b>, <b>details</b>
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
                    this.activities = [];
                    break;
                case 'history':
                    this.history = [];
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
     * @returns {Object} A copy of the reportsList pagination object without the totalPageCount
     */
    function getPaginationForServer(tableState){

        var pag = {
            offset: tableState ? tableState.pagination.start : 0,
            pageSize: listSize
        };
        
        return pag;
    }
	
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
            searchCriteriaMap: {
                REPORT_TYPE: actServ.reportsList.searchObject.REPORT_TYPE
            }
        };
        
        /*activityRestService.getActivityList(payload).then(function(response){
            if (response.pagination.totalPageCount !== 0){
                actServ.reportsList.pagination.totalPageCount = response.pagination.totalPageCount;
            }
            
            actServ.activities = response.resultList;
            actServ.displayedActivities = [].concat(actServ.activities);
            if (angular.isDefined(callback) && angular.isDefined(tableState)){
                callback(tableState);
            }
            
            if (!angular.isDefined(callback) && angular.isDefined(actServ.reportsList.tableState)){
                actServ.reportsList.tableState.pagination.numberOfPages = actServ.reportsList.pagination.totalPageCount; 
            }
            
            actServ.reportsList.isLoading = false;
        }, function(error){
            actServ.reportsList.isLoading = false;
            actServ.reportsList.hasError = true;
        });*/

        //TODO integrate service
        var response = activityRestService.getActivityList(payload);

        if (response.totalItemsCount !== 0){
            actServ.reportsList.pagination.totalPageCount = parseInt(response.totalItemsCount/listSize + 1);
        }

        actServ.activities = response.resultList;
        actServ.displayedActivities = [].concat(actServ.activities);
        if (angular.isDefined(callback) && angular.isDefined(tableState)){
            callback(tableState);
        }
        
        actServ.reportsList.isLoading = false;
        ///////////////////////////

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
        //FIXME check the uniqueReportIdList, maybe it needs some logic to check which id to use
        activityRestService.getReportHistory(actServ.overview.fluxReportReferenceId, actServ.overview.uniqueReportIdList[0].fluxReportSchemeId).then(function(response){
            actServ.historyList.isLoading = false;
            actServ.history = response;
            actServ.displayedHistory = [].concat(actServ.history);
        }, function(error){
            actServ.historyList.isLoading = false;
            actServ.historyList.hasError = true;
        });
    };

	return actServ;
});
