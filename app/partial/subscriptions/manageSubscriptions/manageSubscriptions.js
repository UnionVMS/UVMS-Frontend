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
 * @name ManagesubscriptionsCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param $state {Service} angular ui-router state service
 * @param subscriptionsService {Service} The subscriptions service <p>{@link unionvmsWeb.subscriptionsService}</p>
 * @param subscriptionsRestService {Service} The subscriptions REST service <p>{@link unionvmsWeb.subscriptionsRestService}</p>
 * @param Subscription {Service} The subscriptions model <p>{@link unionvmsWeb.Subscription}</p>
 * @param confirmationModal {Service} The confirmation modal service
 * @param unitConversionService {Service} the unit conversion service
 * @description
 *  The controller for the search and list of subscriptions view
 */
angular.module('unionvmsWeb').controller('ManagesubscriptionsCtrl',function($scope, locale, $state, subscriptionsService, subscriptionsRestService, Subscription, confirmationModal, unitConversionService){
    $scope.subServ = subscriptionsService;
    $scope.subscriptionsList = [];
    $scope.displayedSubscriptions = [];
    $scope.isLoading = false;
    $scope.msgStatus = {
        visible: false,
        type: undefined,
        msg: undefined
    };

    /**
     * Initialize Control function
     *
     * @memberOf ManagesubscriptionsCtrl
     * @private
     */
    function init(){
        $scope.subscription = new Subscription(true);
        $scope.subServ.layoutStatus.isForm = false;
        $scope.searchSubscriptions();
        $scope.isInitialized = true;
    }

    /**
     * Reset the subscriptions list
     *
     * @memberOf ManagesubscriptionsCtrl
     * @private
     */
    function resetSubscriptionsList() {
        $scope.subscriptionsList = [];
        $scope.displayedSubscriptions = [];
    }

    /**
     * Update the message status
     *
     * @memberOf ManagesubscriptionsCtrl
     * @private
     * @param {Boolean} visibility - Wether the message should be visible or not
     * @param {String} type - The type of message (info|error|success)
     * @param {String} msg - The message locale string to be displayed
     */
    function updateMsgStatus(visibility, type, msg) {
        $scope.msgStatus = {
            visible: visibility,
            type: type,
            msg: 'subscriptions.' + msg
        };
    }

    /**
     * Search for subscriptions using the defined criteria
     *
     * @memberOf ManagesubscriptionsCtrl
     * @public
     * @alias searchSubscriptions
     */
    $scope.searchSubscriptions = function () {
        $scope.isLoading = true;
        resetSubscriptionsList();
        var queryParams = getSearchParams();
        subscriptionsRestService.getSubscriptionsList(queryParams).then(function (response) {
            $scope.subscriptionsList = response.subscriptionList;
            $scope.displayedSubscriptions = [].concat($scope.subscriptionsList);
            $scope.isLoading = false;
        }, function (error) {
            $scope.isLoading = false;
            updateMsgStatus(true, 'error', 'error_loading_subscriptions');
        });
    };

    /**
     * Get all search query parameters including sorting to search for subscriptions
     *
     * @memberOf ManagesubscriptionsCtrl
     * @private
     * @returns {Object} An object containing query parameters and sorting properties
     */
    function getSearchParams() {
        var data = {
            queryParameters: {}
        };
        angular.forEach($scope.subscription, function (value, key) {
            if (angular.isDefined(value)){
                if (key === 'isActive'){
                    key = 'enabled';
                } else if (key === 'communicationChannel'){
                    key = 'channel';
                }

                if (key === 'startDate' || key === 'endDate'){
                    value = unitConversionService.date.convertDate(value, 'to_server');
                }

                if (value === 'all'){
                    value = null;
                }

                if (value !== '' && value !== null){
                    this[key] = value;
                }
            }
        }, data.queryParameters);

        return data;
    }

    /**
     * Reset the subscriptions search form
     *
     * @memberOf ManagesubscriptionsCtrl
     * @public
     * @alias resetSearch
     */
    $scope.resetSearch = function () {
        $scope.subscription = new Subscription(true);
        $scope.searchSubscriptions();
    };

    /**
     * Delete a subscription by index
     *
     * @memberOf ManagesubscriptionsCtrl
     * @public
     * @alias deleteSubscription
     * @param {Number} index - The index of the displayed subscription record to be deleted
     */
    $scope.deleteSubscription = function (index) {
        var options = {
            textLabel : locale.getString("subscriptions.delete_subscription_confirmation_text") + $scope.displayedSubscriptions[index].name.toUpperCase() + '?'
        };
        confirmationModal.open(function () {
            subscriptionsRestService.deleteSubscription($scope.displayedSubscriptions[index].id).then(function (response) {
                resetSubscriptionsList();
                $scope.searchSubscriptions();
                updateMsgStatus(true, 'success', 'success_deleting_subscription');
            }, function (error) {
                updateMsgStatus(true, 'error', 'error_deleting_subscription');
            });
            resetSubscriptionsList();
            $scope.isLoading = true;
        }, options);
    };

    /**
     * Edit a subscription by index
     *
     * @memberOf ManagesubscriptionsCtrl
     * @public
     * @alias editSubscription
     * @param {Number} index - The index of the displayed subscription record to be edited
     */
    $scope.editSubscription = function (index) {
        var record = $scope.displayedSubscriptions[index];
        $scope.subServ.layoutStatus.isNewSub = false;
        $state.go('app.newSubscription', {subToEdit: record});
    };

    /**
     * Share subscription
     *
     * @memberOf ManagesubscriptionsCtrl
     * @public
     * @alias shareSubscription
     * @param {Number} index - The index of the subscription to share
     * @param {String} accessibility - The accessibility level with which the subscription will be updated
     */
    $scope.shareSubscription = function (index, accessibility) {
        if ($scope.displayedSubscriptions[index].accessibility !== accessibility){
            var options = {
                textLabel: locale.getString("subscriptions.share_subscription_confirmation_text") + $scope.displayedSubscriptions[index].name.toUpperCase()  + '?'
            };
            confirmationModal.open(function () {
                var record = angular.copy($scope.displayedSubscriptions[index]);
                record.accessibility = accessibility;
                $scope.isLoading = true;
                subscriptionsRestService.updateSubscription(record).then(function (response) {
                    $scope.isLoading = false;
                    $scope.displayedSubscriptions[index].accessibility = accessibility;
                    var srcRecord = _.findWhere($scope.subscriptionsList, {id: $scope.displayedSubscriptions[index].id});
                    srcRecord.accessibility = response.accessibility;
                }, function (error) {
                    $scope.isLoading = false;
                    updateMsgStatus(true, 'error', 'error_sharing_subscription');
                });
            }, options);
        }
    };

    $scope.$on('$destroy', function(){
        $scope.subServ.resetAlert();
    });

    init();
});