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
 * @name DiscardpanelCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param fishingActivityService {Service} fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param reportFormService {Service} report form service <p>{@link unionvmsWeb.reportFormService}</p>
 * @description
 *  The controller for the departure panel partial
 */
angular.module('unionvmsWeb').controller('DiscardpanelCtrl', function ($scope, $state, fishingActivityService, tripSummaryService, loadingStatus, FishingActivity) {
    $scope.faServ = fishingActivityService;
    /**
     * Initialization function
     * 
     * @memberof DiscardpanelCtrl
     * @private
     */
    var init = function () {
        if ($scope.faServ.reloadFromActivityHistory === false){
            $scope.faServ.getFishingActivity(new FishingActivity('discard'));
        } else  {
            $scope.faServ.reloadFromActivityHistory = false;
        }
    };

    init();
});