/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityService
 * @param locale {Service} angular locale service
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @attr {Array} breadcrumbPages - An ordered array containing all possible values for the breadcrumb
 * @attr {Array} activities - An array containing the list of fishing activities reports
 * @attr {Object} overview - An object containing the data to be displayed at the activity overview partial
 * @attr {Object} details - An object containing the data to be displayed at the activity details partial
 * @description
 *  A service to deal with all activity data
 */
angular.module('unionvmsWeb').factory('activityService',function(locale, activityRestService) {
    var actServ = {};
    
    actServ.breadcrumbPages = [{
        title: locale.getString('activity.breadcrumb_reports_list'),
        type: 'activities',
        visible: true
    },{
        title: locale.getString('activity.breadcrumb_report_overview'),
        type: 'overview',
        visible: false
    },{
        title: locale.getString('activity.breadcrumb_report_details'),
        type: 'details',
        visible: false
    }];
    
    actServ.activities = [];
    actServ.overview = {};
    actServ.details = {}
    
    /**
     * Reset attributes of the activity service
     * 
     * @memberof activityService
     * @public
     * @alias reset
     */
    actServ.reset = function(){
        this.activities = [];
        this.overview = {};
        this.details = {};
    };
	
    /**
     * Get the list of activities according to the table pagination and search criteria
     * 
     * @memberof activityService
     * @public
     * @alias getActivityList
     */
    actServ.getActivityList = function(){
        //TODO check the pagination & search criteria
        var payload = {
            pagination: {
                page: 1,
                listSize: 25
            },
            searchCriteria: []
        };
        
        
        activityRestService.getActivityList(payload).then(function(response){
            actServ.activities = response.data;
        }, function(error){
            //TODO
        });
    };
    

	return actServ;
});