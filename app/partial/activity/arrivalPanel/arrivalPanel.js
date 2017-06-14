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
 * @name ArrivalpanelCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param fishingActivityService {Service} fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @attr {String} srcTab - Identifies from where the partial is being initialized. It is defined through ng-init and supports the following values: reports, activity
 * @description
 *  The controller for the Arrival panel partial
 */
angular.module('unionvmsWeb').controller('ArrivalpanelCtrl', function($scope, $state, fishingActivityService, mdrCacheService, tripSummaryService, locale, loadingStatus, FishingActivity, reportingNavigatorService, spatialHelperService, $modalStack) {
    $scope.faServ = fishingActivityService;

    var arrivalNotification = ($scope.faServ.documentType.toLowerCase() === 'notification') ? true : false;

    /**
     * Initialization function
     * 
     * @memberof ArrivalpanelCtrl
     * @private
     */
    var init = function() {
        $scope.faServ.getFishingActivity(new FishingActivity(arrivalNotification ? 'arrival_notification' : 'arrival_declaration'), arrivalData);
    };

    /**
      * A callback function to get the data for clock panel
      * 
      * @memberof ArrivalpanelCtrl
      * @public
      * @alias arrivalData
      * @returns data for clock panel
      */
    var arrivalData = function() {
        $scope.data = [{
            "caption": (arrivalNotification === true) ? locale.getString('activity.clock_panel_estimated_time') : locale.getString('activity.clock_panel_arrival_time'),
            "arrivalTime": $scope.faServ.activityData.activityDetails.arrivalTime
        }];
        
        if ($scope.faServ.activityData.activityDetails.intendedLandingTime){
            $scope.data.push({
                "caption": locale.getString('activity.clock_panel_intended_start_time'),
                "arrivalTime": $scope.faServ.activityData.activityDetails.intendedLandingTime
            });
        }
        getReasonCodes($scope.faServ.activityData.activityDetails);
    };

     /**
     * Get human readable text from MDR for Reason in activity Details.
     * 
     * @memberof ArrivalpanelCtrl
     * @public
     * @alias getReasonCode
     * @returns Reason code
     */
    var getReasonCodes = function (obj) {
        loadingStatus.isLoading('FishingActivity', true);
        
        mdrCacheService.getCodeList('FA_REASON_ARRIVAL').then(function (response) {  
            var reasonDesc = _.where(response, { code: obj.reason });
            if(angular.isDefined(reasonDesc) && reasonDesc.length > 0){
               $scope.data[0].reason = obj.reason + ' - ' + reasonDesc[0].description;
            }else{
               $scope.data[0].reason = obj.reason;
            }
            loadingStatus.isLoading('FishingActivity', false);
        },function(error) {
            //TODO deal with error from rest service
            loadingStatus.isLoading('FishingActivity', false);
        });
    };

    /**
      * Check if a location tile should be clickable taking into consideration the route and the report configuration
      * 
      * @memberof ArrivalpanelCtrl
      * @public
      * @alias isLocationClickable
      * @returns {Boolean} Whether the location tile should be clickable or not
      */
    $scope.isLocationClickable = function() {
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && tripSummaryService.withMap) {
            clickable = true;
        }

        return clickable;
    };


    /**
     * The click location callback function
     * 
     * @memberof ArrivalpanelCtrl
     * @public
     * @alias locationClickCallback
     */
    $scope.locationClickCallback = function() {
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        console.log('This is the click callback');
        spatialHelperService.fromFAView = true;
        $modalStack.dismissAll();
        angular.element('body').removeClass('modal-open');

        reportingNavigatorService.goToView('liveViewPanel', 'mapPanel');
    };


    init();

});