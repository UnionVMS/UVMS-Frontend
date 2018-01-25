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
 * @name NewsubscriptionCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param subscriptionsService {Service} The subscriptions service <p>{@link unionvmsWeb.subscriptionsService}</p>
 * @param subscriptionsRestService {Service} The subscriptions REST service <p>{@link unionvmsWeb.subscriptionsRestService}</p>
 * @param Subscription {Service} The subscriptions model <p>{@link unionvmsWeb.Subscription}</p>
 * @param $stateParams {Service} angular ui router stateParams service
 * @param loadingStatus {Service} The loading status service for the loading panel directive
 * @description
 *  The controller for the subscription creating and editing view
 */
angular.module('unionvmsWeb').controller('NewsubscriptionCtrl',function($scope, locale, subscriptionsService, subscriptionsRestService , Subscription, $stateParams, loadingStatus){
    $scope.subServ = subscriptionsService;
    $scope.isSubmitting = false;

    /**
     * Initialize Control function
     *
     * @memberOf NewsubscriptionCtrl
     * @private
     */
    function init() {
        $scope.subscription = new Subscription(false);
        $scope.subServ.layoutStatus.isForm = true;

        if (_.keys($stateParams).length > 0 && $stateParams.subToEdit !== null){
            $scope.subscription = $scope.subscription.fromJson($stateParams.subToEdit);
        }
    }

    /**
     * Validate USM Endpoint and Communication channels that cannot be undefined
     *
     * @memberOf NewsubscriptionCtrl
     * @private
     * @returns {boolean} A boolean indicating whether USM endpoint and communication channels are valid or not
     */
    var validateUsmData = function () {
        var valid = true;
        if (angular.isUndefined($scope.subscription.endPoint)){
            valid = false;
            $scope.subServ.setAlertStatus('error', 'subscriptions.error_no_endpoint', true, 5000);
        } else if (angular.isUndefined($scope.subscription.communicationChannel)){
            valid = false;
            $scope.subServ.setAlertStatus('error', 'subscriptions.error_no_comm_channels', true, 5000);
        }

        return valid;
    };

    /**
     * Save or update subscription
     *
     * @memberOf NewsubscriptionCtrl
     * @public
     * @alias saveSubscription
     */
    $scope.saveSubscription = function(){
        $scope.isSubmitting = true;
        if ($scope.subscriptionForm.$valid){
            var isValid = validateUsmData();
            if (isValid === true){
                loadingStatus.isLoading('Subscriptions', true, 0);
                if ($scope.subServ.layoutStatus.isNewSub === true){
                    subscriptionsRestService.createSubscription($scope.subscription.toJson($scope.subscription)).then(function (response) {
                        loadingStatus.isLoading('Subscriptions', false, 0);
                        $scope.subServ.setAlertStatus('success', 'subscriptions.success_saving_subscription', true, 5000);
                        $scope.subServ.layoutStatus.isNewSub = false;
                        $scope.isSubmitting = false;
                    }, function (error) {
                        loadingStatus.isLoading('Subscriptions', false, 0);
                        $scope.subServ.setAlertStatus('error', 'subscriptions.error_saving_subscription', true, 5000);
                        $scope.isSubmitting = false;
                    });
                } else {
                    subscriptionsRestService.updateSubscription($scope.subscription.toJson($scope.subscription)).then(function (response) {
                        loadingStatus.isLoading('Subscriptions', false, 0);
                        $scope.subServ.setAlertStatus('success', 'subscriptions.success_updating_subscription', true, 5000);
                        $scope.subServ.layoutStatus.isNewSub = false;
                        $scope.isSubmitting = false;
                    }, function (error) {
                        loadingStatus.isLoading('Subscriptions', false, 0);
                        $scope.subServ.setAlertStatus('error', 'subscriptions.error_updating_subscription', true, 5000);
                        $scope.isSubmitting = false;
                    });
                }
            }
        }
    };

    init();
});