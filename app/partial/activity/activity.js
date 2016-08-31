/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivityCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param activityService {Service} the activity service <p>{@link unionvmsWeb.activityService}</p>
 * @param breadcrumbService {Service} the breadcrumb service <p>{@link unionvmsWeb.breadcrumbService}</p>
 * @description
 *  The controller for the activity tab  
 */
angular.module('unionvmsWeb').controller('ActivityCtrl',function($scope, locale, activityService, breadcrumbService){
    $scope.actServ = activityService;
    
    locale.ready('activity').then(function(){
        init();
    });
    
    /**
     * Initialization function
     * 
     * @memberof ActivityCtrl
     * @private
     */
    var init = function(){
        $scope.actServ.getActivityList();
    }; 
    
    /**
     * Check if partial should be visible according to the breadcrumbPages item status
     * 
     * @memberof ActivityCtrl
     * @public
     * @alias isPartialVisible
     * @param {Number} idx - The index of the item that will be checked
     * @retuns {Boolean} Whether the item is visible or not
     */
    $scope.isPartialVisible = function(idx){
        return $scope.actServ.breadcrumbPages[idx].visible;
    };
    
    /**
     * Make a certain partial visible using the breadcrumbPages array
     * 
     *  @memberof ActivityCtrl
     *  @public
     *  @alias goToView
     *  @param {Number} idx - The index of the item that should be made visible
     */
    $scope.goToView = function(idx){
        breadcrumbService.goToItem(idx);
    };
    
    /**
     * A callback function passed into the breadcrumb directive that will clean data objects upon breadcrumb click
     * 
     * @memberof ActivityCtrl
     * @public
     * @alias breadcrumbClick
     */
    $scope.breadcrumbClick = function(){
        var idx = breadcrumbService.getActiveItemIdx() + 1;
        for (var i = idx; i < $scope.actServ.breadcrumbPages.length; i++){
            if (_.isObject($scope.actServ[$scope.actServ.breadcrumbPages[i].type])){
                $scope.actServ[$scope.actServ.breadcrumbPages[i].type] = {};
            } else if (_.isArray($scope.actServ[$scope.actServ.breadcrumbPages[idx].type])){
                $scope.actServ[$scope.actServ.breadcrumbPages[i].type] = [];
            }
        }
    };
});