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
 * @name TripspanelCtrl
 * @param $scope {Service} controller scope
 * @param genericMapService {Service} the generic map service <p>{@link unionvmsWeb.genericMapService}</p>
 * @param tripSummaryService {Service} the trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @param spatialConfigAlertService {Service} the spatial config alert service <p>{@link unionvmsWeb.spatialConfigAlertService}</p>
 * @param Trip {unionvmsWeb.Trip} the loading status service <p>{@link unionvmsWeb.Trip}</p>
 * @description
 *  The controller for the trip summary tab  
 */
angular.module('unionvmsWeb').controller('TripspanelCtrl', function ($scope, genericMapService, tripSummaryService, spatialConfigAlertService, Trip) {

    $scope.alert = spatialConfigAlertService;
    $scope.tripSummServ = tripSummaryService;

    $scope.tripSummServ.resetMapConfigs();

    /**
     * Sets map configs in trip summary service
     * 
     * @memberof TripspanelCtrl
     * @private
     */
    var setTripSumServiceMapConfigs = function () {
        $scope.tripSummServ.mapConfigs = angular.copy(genericMapService.mapBasicConfigs);
    };

    genericMapService.setMapBasicConfigs(setTripSumServiceMapConfigs);

    /**
     * Close a trip summary tab
     * 
     * @memberof TripspanelCtrl
     * @public
     * @alias closeTab
     * @param {Number} index - The index of the tab to be closed
     */
    $scope.closeTab = function (index) {
        $scope.tripSummServ.tabs.splice(index, 1);
        if ($scope.tripSummServ.tabs.length < 1) {
            $scope.navigateBack();
        }
    };

    /**
     * Initialize trip model for the current trip summary tab
     * 
     * @memberof tripSummaryService
     * @public
     * @alias initializeTrip
     * @param {Number} index - The index of the tab to be initialized
     */
    $scope.tripSummServ.initializeTrip = function (index) {
        if (angular.isDefined($scope.tripSummServ.tabs[index])) {
            $scope.tripSummServ.trip = new Trip($scope.tripSummServ.tabs[index].title);
            $scope.trip = $scope.tripSummServ.trip;
        }
    };

    /**
     * Quit the trip summary view
     * 
     * @memberof TripspanelCtrl
     * @public
     * @alias navigateBack
     */
    $scope.navigateBack = function () {
        var currentView = $scope.repNav.getCurrentView();
        if(currentView === 'tripSummary'){
            $scope.tripSummServ.tabs.splice(0, $scope.tripSummServ.tabs.length);
            $scope.repNav.goToView('liveViewPanel', 'mapPanel');
        }else{
            $scope.repNav.goToPreviousView();
        }
    };

});