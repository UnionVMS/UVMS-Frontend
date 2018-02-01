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
 * @name ActivityreportslistCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @param visibilityService {Service} The visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @param fishingActivityService {Service} The fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @attr {Array} displayedActivities - The array of displayed activities used by smart tables
 * @description
 *  The controller for the fisihing activity reports table list
 */
angular.module('unionvmsWeb').controller('ActivityreportslistCtrl',function($scope, activityService, visibilityService, fishingActivityService, $stateParams, $state){
    $scope.actServ = activityService;
    $scope.faServ = fishingActivityService;
    $scope.attrVisibility = visibilityService;
    $scope.visServ = visibilityService;
    //Automatically open a fishing activity details page when navigating from another tab
   /* if (_.keys($stateParams).length > 0 && $stateParams.activityId !== null && $stateParams.tripId !== null && $stateParams.activityType !== null){
        $scope.faServ.id = $stateParams.activityId;
        $scope.faServ.activityType = $stateParams.activityType.toLowerCase();
        if ($stateParams.faReportType !== null){
            $scope.faServ.documentType = $stateParams.faReportType.toLowerCase();
        }
        $scope.goToView(3);
        
        $stateParams.activityType = null;
        $stateParams.activityId = null;
        $stateParams.tripId = null;
        $stateParams.faReportType = null;
    }*/


    $scope.updateActivityList = function(tableState, ctrl){
        $scope.callServer(tableState, ctrl, 'reportsList');
    };

    
    /**
     * Open the history partial through the index of the table row record
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias openOverview
     * @param {Number} idx - The index of the activity record to use to fetch the history data
     */
    $scope.openHistory = function(idx){
        $scope.actServ.overview = $scope.actServ.displayedActivities[idx];
        if (angular.isDefined($scope.actServ.overview.fluxReportReferenceId) && $scope.actServ.overview.uniqueReportIdList.length > 0){
            $scope.actServ.getHistory();
            $scope.goToView(1);
        }
    };
    
    /**
     * Update the fishing activities column visibility settings
     *  
     * @memberof AdvancedsearchformCtrl
     * @public
     * @alias updateVisibilityCache
     * @param {String} column - the column name property to be updated
     */
    $scope.updateVisibilityCache = function(column){
        $scope.visServ.updateStorage(column);
    };

    /**
     * Open the activity details partial through the index of the table row record
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias openDetails
     * @param {Number} idx - The index of the activity record to use to fetch the detail data
     */
    $scope.openDetails = function(idx){
        $scope.actServ.overview = $scope.actServ.displayedActivities[idx]; //TODO check if we need this
        $scope.faServ.id = $scope.actServ.displayedActivities[idx].fishingActivityId;
        $scope.faServ.activityType = $scope.actServ.displayedActivities[idx].activityType.toLowerCase();
        $scope.faServ.isCorrection = $scope.actServ.displayedActivities[idx].hasCorrection;
        $scope.faServ.documentType = $scope.actServ.displayedActivities[idx].FAReportType.toLowerCase();
        
        $scope.goToView(5);
    };
});
