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
 * @param visibilityService {Service} The visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @param tripSummaryService {Service} the trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @param $stateParams {Service} the angular ui router state params service
 * @attr {Array} displayedTrips - The array of displayed trips used by smart tables
 * @description
 *  The controller for the fisihing trips reports table list
 */
angular.module('unionvmsWeb').controller('TripreportslistCtrl',function($scope, tripSummaryService, visibilityService, $stateParams){

    $scope.isTripFilterVisible = false;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    $scope.attrVisibility = visibilityService;
    $scope.tripSummServ = tripSummaryService;
    $scope.activityTypes = [];
    var stLastTableState;
   

    $scope.updateTripsList = function(tableState, ctrl){
      if (angular.isUndefined($stateParams.tripId) || $stateParams.tripId === null){
          $scope.callServer(tableState, ctrl, 'tripsList', true);
      } else {
          $scope.actServ.tripsList.stCtrl = ctrl;
          $scope.actServ.tripsList.tableState = tableState;
      }
    };

    $scope.openTripSummary = function(tripId){
      $scope.tripSummServ.openNewTrip(tripId);
      $scope.goToView(3);
    };


     /**
     * Update the fishing activities column visibility settings
     *  
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias updateVisibilityCache
     * @param {String} column - the column name property to be updated
     */
    $scope.updateVisibilityCache = function(column){
      $scope.attrVisibility.updateStorage(column, 'trips');
  };

});
