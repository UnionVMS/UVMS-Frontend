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
 * @name DeparturepanelCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param fishingActivityService {Service} fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param reportFormService {Service} report form service <p>{@link unionvmsWeb.reportFormService}</p>
 * @param activityRestService {Service} activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @attr {String} srcTab - Identifies from where the partial is being initialized. It is defined through ng-init and supports the following values: reports, activity
 * @description
 *  The controller for the departure panel partial
 */
angular.module('unionvmsWeb').controller('DeparturepanelCtrl',function($scope, $state, fishingActivityService, tripSummaryService, activityRestService, loadingStatus, FishingActivity){
    $scope.faServ = fishingActivityService;
    
    /**
     * Initialization function for the departure panel
     * 
     * @memberof DeparturepanelCtrl
     * @private
     */
    var init = function(){
        $scope.faServ.getFishingActivity(new FishingActivity('departure'));
    };
    
    init();
});
