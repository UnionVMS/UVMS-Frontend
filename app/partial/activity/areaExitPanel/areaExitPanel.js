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
 * @name AreaexitpanelCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param fishingActivityService {Service} fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param reportFormService {Service} report form service <p>{@link unionvmsWeb.reportFormService}</p>
 * @param activityRestService {Service} activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param tripSummaryService {Service} trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @description
 *  The controller for the Area Exit panel partial
 */
angular.module('unionvmsWeb').controller('AreaexitpanelCtrl', function ($scope, $state, fishingActivityService, activityRestService, loadingStatus, FishingActivity, tripSummaryService) {
    $scope.faServ = fishingActivityService;
    /**
     * Initialization function
     * 
     * @memberof AreaexitpanelCtrl
     * @private
     */
    var init = function () {
        $scope.faServ.getFishingActivity(new FishingActivity('area_exit'));
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getTripCatchDetail($scope.faServ.id).then(function (response) {
            $scope.fishingTripDetails = response;
            loadingStatus.isLoading('FishingActivity', false);
        }, function (error) {
            //TODO deal with error from service
            loadingStatus.isLoading('FishingActivity', false);
        });
    };
    
    /**
     * The click area callback function
     * 
     * @memberof AreaexitpanelCtrl
     * @public
     * @alias areaClickCallback
     */
    $scope.areaClickCallback = function(){
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        console.log('This is the click callback');
    };
    
    /**
     * Check if an area should be clickable taking into consideration the route and the report configuration
     * 
     * @memberof AreaexitpanelCtrl
     * @public
     * @alias isAreaClickable
     * @returns {Boolean} Whether the area should be clickable or not
     */
    $scope.isAreaClickable = function(){
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && tripSummaryService.withMap){
            clickable = true;
        }
        
        return clickable;
    };

    init();

});