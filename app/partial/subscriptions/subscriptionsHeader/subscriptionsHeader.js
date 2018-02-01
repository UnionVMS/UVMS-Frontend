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
 * @name SubscriptionsheaderCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param subscriptionsService {Service} The subscriptions service <p>{@link unionvmsWeb.subscriptionsService}</p>
 * @param userService {Service} The USM user service
 * @param $stateParams {Service} The angular ui router $stateParams service
 * @description
 *  The controller for the subscription tabbed header
 */
angular.module('unionvmsWeb').controller('SubscriptionsheaderCtrl',function($scope, subscriptionsService, locale, userService, $stateParams){
    $scope.subServ = subscriptionsService;

    /**
     * Get the title for the editing subscription tab
     *
     * @memberOf SubscriptionsheaderCtrl
     * @public
     * @alias getTitle
     * @returns {String} The title of the tab
     */
    $scope.getTitle = function(){
        var title = locale.getString('subscriptions.pagemenu_new_subscription');
        if ($scope.subServ.layoutStatus.isNewSub === false) {
            title = locale.getString('subscriptions.pagemenu_edit_subscription');
        }

        return title;
    };

    /**
     * Initialization function
     *
     * @memberOf SubscriptionsheaderCtrl
     * @private
     */
    function init(){
        if(!userService.isAllowed('MANAGE_SUBSCRIPTION', 'Subscription', true) && _.keys($stateParams).length === 0){
            $scope.subServ.layoutStatus.isNewTabVisible = false;
        }
    }

    init();
});