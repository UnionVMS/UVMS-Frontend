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
 * @name RolescarouselCtrl
 * @param $scope {Service} The controller scope
 * @param $timeout {Service} The angular timeout
 * @param tripSummaryService {Service} The trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @attr {Object} currentRole - The current displayed role in the roles carousel
 * @description
 *  The controller for the mapTile directive ({@link unionvmsWeb.mapTile})
 */
angular.module('unionvmsWeb').controller('RolescarouselCtrl',function($scope,$timeout,tripSummaryService){

    $scope.tripSummServ = tripSummaryService;
    $scope.currentRole = {index: 0};

    /**
     * Update combobox when the carousel changes
     * 
     * @memberof RolescarouselCtrl
     * @public
     * @alias updateCombo
     * @param {Array} slides - array containing the slides of the carousel
     */
    $scope.updateCombo = function(slides) {
        $timeout(function() {
            $scope.currentRole.index = _.where(slides,{'active': true})[0].index;
        }, 1);
    };
});
