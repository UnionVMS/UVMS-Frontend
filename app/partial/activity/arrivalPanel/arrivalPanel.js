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

angular.module('unionvmsWeb').controller('ArrivalpanelCtrl', function($scope, $state, fishingActivityService, tripSummaryService, activityRestService, locale, loadingStatus, Arrival, ArrivalNotification) {
    $scope.faServ = fishingActivityService;
    
    var arrivalNotification = true;

      /**
       * Initialization function
       * 
       * @memberof ArrivalpanelCtrl
       * @private
       */
    var init = function() {
        if(arrivalNotification){
            $scope.faServ.getFishingActivity(new ArrivalNotification(), arrivalData);
        }else{
            $scope.faServ.getFishingActivity(new Arrival(),arrivalData);
        }
        
        loadingStatus.isLoading('FishingActivity', true);
        activityRestService.getTripCatchDetail($scope.faServ.id).then(function(response) {
            $scope.fishingTripDetails = response;
            loadingStatus.isLoading('FishingActivity', false);
        }, function(error) {
            //TODO deal with error from service
            loadingStatus.isLoading('FishingActivity', false);
        });
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
            "reason": $scope.faServ.activityData.arrival.reason,
            "arrivalTime": (arrivalNotification === true) ? $scope.faServ.activityData.arrival.estimatedArrival : $scope.faServ.activityData.arrival.arrivalTime,
            "showClock": "true"
        },
        {
            "caption": (arrivalNotification === true) ? "" : locale.getString('activity.clock_panel_intended_start_time'),
            "arrivalTime": (arrivalNotification === true) ? "" : $scope.faServ.activityData.arrival.intendedLandingTime,
            "showClock": (arrivalNotification === true) ? "false" : "true"
        }];
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
    };


    init();

});