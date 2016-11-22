/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name DeparturepanelCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param fishingActivityService {Service} fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param reportFormService {Service} report form service <p>{@link unionvmsWeb.reportFormService}</p>
 * @description
 *  The controller for the departure panel partial
 */
angular.module('unionvmsWeb').controller('DeparturepanelCtrl',function($scope, $state, fishingActivityService, reportFormService){
    $scope.faServ = fishingActivityService;
    $scope.faServ.getData('departure', {}); //FIXME to move to other place
    
    /**
     * Check if a location tile should be clickable taking into consideration the route and the report configuration
     * 
     * @memberof DeparturepanelCtrl
     * @public
     * @alias isLocationClickable
     * @returns {Boolean} Whether the location tile should be clickable or not
     */
    $scope.isLocationClickable = function(){
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && reportFormService.currentReport.withMap){
            clickable = true;
        }
        
        return clickable;
    };
    
    /**
     * The click location callback function
     * 
     * @memberof DeparturepanelCtrl
     * @public
     * @alias locationClickCallback
     */
    $scope.locationClickCallback = function(){
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        console.log('This is the click callback');
    };
});