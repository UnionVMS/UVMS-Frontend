/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityService
 * @param locale {Service} angular locale service
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param visibilityService {Service} the visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @attr {Array} breadcrumbPages - An ordered array containing all possible values for the breadcrumb
 * @attr {Array} activities - An array containing the list of fishing activities reports
 * @attr {Object} overview - An object containing the data to be displayed at the activity overview partial
 * @attr {Object} details - An object containing the data to be displayed at the activity details partial
 * @attr {Object} reportsList - An object containing the state of the FA reports table such as pagination, sorting, smart table tableState
 * @description
 *  A service to deal with all activity data
 */
angular.module('unionvmsWeb').factory('activityService',function(locale, activityRestService, visibilityService) {
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
    actServ.overview = {};
    actServ.details = {};
    
    actServ.reportsList = getReportsListObject();
    
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
            sortKey: {
                field: undefined,
                order: undefined,
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
        
        if (angular.isDefined(actServ.reportsList.tableState)){
            actServ.reportsList.tableState.pagination = {
                start: 0,
                number: listSize,
                numberOfPages: 1
            };
        }
    };
    
    /**
     * Reset attributes of the activity service (includes activities, overvie, details and reportsList
     * 
     * @memberof activityService
     * @public
     * @alias reset
     */
    actServ.reset = function(){
        this.activities = [];
        this.overview = {};
        this.details = {};
        this.reportsList = getReportsListObject();
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
        } else {
            this[type] = {};
        }
    };
    
    /**
     * Get proper pagination object to be sent to the server while requesting for FA reports
     * 
     * @memberof activityService
     * @private
     * @returns {Object} A copy of the reportsList pagination object without the totalPageCount
     */
    function getPaginationForServer(){
        var pag = angular.copy(actServ.reportsList.pagination);
        pag.totalPageCount = undefined;
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
            pagination: getPaginationForServer(),
            sortKey: actServ.reportsList.sortKey,
            searchCriteriaMap: actServ.reportsList.searchObject
        };
        
        activityRestService.getActivityList(payload).then(function(response){
            actServ.reportsList.pagination.totalPageCount = response.pagination.totalPageCount;
            actServ.activities = response.resultList;
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
        });
    };
    
    /**
     * Get the user preferences for the activity
     * 
     * @memberof activityService
     * @public
     */
    actServ.getUserPreferences = function(){
        activityRestService.getUserPreferences().then(function(response){
            //FIXME when service is fixed with order and values
            var visibilitySettings = {
                fishingActivities: {
                    table: {
                        values: response.fishingActivityConfig.summaryReport,
                        order: response.fishingActivityConfig.summaryReport //FIXME
                    }
                }
            };
            visibilityService.setVisibility(visibilitySettings);
        }, function(error){
            //TODO
        });
    };

	return actServ;
});