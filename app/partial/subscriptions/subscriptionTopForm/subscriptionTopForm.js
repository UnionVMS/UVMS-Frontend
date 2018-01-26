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
 * @name SubscriptiontopformCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param $stateParams {Service} angular ui router stateParams service
 * @param subscriptionsService {Service} The subscriptions service <p>{@link unionvmsWeb.subscriptionsService}</p>
 * @param subscriptionsRestService {Service} The subscriptions REST service <p>{@link unionvmsWeb.subscriptionsRestService}</p>
 * @param Subscription {Service} The subscriptions model <p>{@link unionvmsWeb.Subscription}</p>
 * @param configurationService {Service} the configuration service
 * @description
 *  The controller for the top form of subscriptions edit and search pages
 */
angular.module('unionvmsWeb').controller('SubscriptiontopformCtrl',function($scope, locale, $stateParams, subscriptionsService, subscriptionsRestService , configurationService){
    $scope.subServ = subscriptionsService;
    $scope.isLoadingFromJson = false;

    $scope.organisationItems = [];
    $scope.endPointsItems = [];
    $scope.commChannelItems = [];
    $scope.subscriptionTypeItems = [
        {'text': locale.getString('subscriptions.subscription_type_tx_pull'), 'code': 'TX_PULL'},
        {'text': locale.getString('subscriptions.subscription_type_tx_push'), 'code': 'TX_PUSH'}
    ];
    $scope.accessibilityItems = [
        {'text': locale.getString('spatial.reports_table_share_label_private'), 'code': 'PRIVATE'},
        {'text': locale.getString('spatial.reports_table_share_label_scope'), 'code': 'SCOPE'},
        {'text': locale.getString('spatial.reports_table_share_label_public'), 'code': 'PUBLIC'}
    ];
    $scope.messageTypeItems = [
        {'text': locale.getString('subscriptions.flux_fa_report_message'), 'code': 'FLUX_FA_REPORT_MESSAGE'},
        {'text': locale.getString('subscriptions.flux_fa_query_message'), 'code': 'FLUX_FA_QUERY_MESSAGE'}
        /*{'text': locale.getString('subscriptions.flux_vessel_position_message'), 'code': 'FLUX_VESSEL_POSITION_MESSAGE'},
        {'text': locale.getString('subscriptions.flux_sales_query_message'), 'code': 'FLUX_SALES_QUERY_MESSAGE'},
        {'text': locale.getString('subscriptions.flux_sales_message'), 'code': 'FLUX_SALES_MESSAGE'}*/
    ];

    /**
     * Initialize Control function
     *
     * @memberOf SubscriptiontopformCtrl
     * @private
     */
    function init(){
        if ($scope.subServ.layoutStatus.isForm === true){
            $scope.startDateId = 'startDate-Form';
            $scope.endDateId = 'endDate-Form';
        } else {
            $scope.startDateId = 'startDate-Search';
            $scope.endDateId = 'endDate-Search';
        }

        if ($scope.subServ.layoutStatus.isForm === true && $scope.subServ.layoutStatus.isNewSub === false && _.keys($stateParams).length > 0 && $stateParams.subToEdit !== null){
            $scope.isLoadingFromJson = true;
        }
        setupOrgCombo();
    }

    /**
     * Setup the Organisations combobox items
     *
     * @memberof SubscriptiontopformCtrl
     * @private
     */
    var setupOrgCombo = function(){
        var allOrganisations = configurationService.getValue('ORGANISATIONS', 'results');
        angular.forEach(allOrganisations, function(item){
            var text = item.name;
            if (item.parent !== null){
                text = item.parent + ' / ' + item.name;
            }
            if (($scope.subServ.layoutStatus.isForm === true && ((item.status === 'E' && $scope.subServ.layoutStatus.isNewSub === true) || $scope.subServ.layoutStatus.isNewSub === false)) || $scope.subServ.layoutStatus.isForm === false){
                $scope.organisationItems.push({'text': text, 'code': item.organisationId, "enabled": item.status === 'E' ? true : false});
            }
        });

        if ($scope.organisationItems.length === 0){
            $scope.subServ.setAlertStatus('error', 'subscriptions.error_no_organisations', true);
        }

        if ($scope.isLoadingFromJson === true){
            var rec = _.findWhere(allOrganisations, {organisationId: $scope.subscription.organisation});
            if (angular.isDefined(rec)){
                $scope.loadEndPoints();
                if (rec.status === 'D'){
                    $scope.subServ.setAlertStatus('error', 'subscriptions.error_organisation_is_disabled', true);
                }
            } else {
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_organisation_is_deleted', true);
                $scope.subscription.endPoint = undefined;
                $scope.subscription.communicationChannel = undefined;
            }
        }
    };

    /**
     * Reset dependent comboboxes and reset endpoints and communication channels model
     *
     * @memberOf SubscriptiontopformCtrl
     * @private
     */
    var resetDependentombos = function () {
        $scope.endPointsItems = [];
        $scope.commChannelItems = [];
        if ($scope.isLoadingFromJson === false){
            $scope.subscription.endPoint = undefined;
            $scope.subscription.communicationChannel = undefined;
        }
    };

    /**
     * Get EndPoint and Communication Channel data for a specific organisation from USM
     *
     * @memberOf SubscriptiontopformCtrl
     * @public
     * @alias loadEndPoints
     */
    $scope.loadEndPoints = function(){
        resetDependentombos();
        $scope.checkForErrorMsg('endPoint');
        if (angular.isDefined($scope.subscription.organisation)){
            subscriptionsRestService.getOrganisationDetails($scope.subscription.organisation).then(function (response) {
                $scope.organisationDetails =  response;
                setupEndPointCombo();
            }, function (error) {
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_loading_organisation', true, 5000);
            });
        }
    };

    /**
     * Setup the End points combobox items
     *
     * @memberOf SubscriptiontopformCtrl
     * @private
     */
    var setupEndPointCombo = function () {
        angular.forEach($scope.organisationDetails.endpoints, function(item){
            if (($scope.subServ.layoutStatus.isForm === true && ((item.status === 'E' && $scope.subServ.layoutStatus.isNewSub === true) || $scope.subServ.layoutStatus.isNewSub === false)) || $scope.subServ.layoutStatus.isForm === false){
                $scope.endPointsItems.push({'text': item.name, 'code': item.endpointId, "enabled": item.status === 'E' ? true : false});
            }
        });

        if ($scope.endPointsItems.length === 0){
            if ($scope.subServ.layoutStatus.isNewSub === false && $scope.isLoadingFromJson === true){
                $scope.subscription.endPoint = undefined;
                $scope.subscription.communicationChannel = undefined;
                $scope.isLoadingFromJson = false;

            }
            if ($scope.subServ.layoutStatus.isForm === true){
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_no_endpoint', true, undefined, 'endPoint');
            }
        }

        if ($scope.isLoadingFromJson === true){
            var rec = _.findWhere($scope.organisationDetails.endpoints, {endpointId : $scope.subscription.endPoint});
            if (angular.isUndefined(rec)){
                $scope.isLoadingFromJson = false;
                $scope.subscription.endPoint = undefined;
                $scope.subscription.communicationChannel = undefined;
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_endpoint_is_deleted', true, undefined, 'endPoint');
            } else {
                $scope.loadCommChannels();
                /*var channelRec = _.findWhere(rec.channelList, {channelId: $scope.subscription.communicationChannel});
                if (angular.isUndefined(channelRec)){
                    $scope.subscription.communicationChannel = undefined;
                    $scope.subServ.setAlertStatus('warning', 'subscriptions.error_comm_channel_is_deleted', true, undefined, 'commChannel');
                }*/
                if (rec.status === 'D'){
                    $scope.subServ.setAlertStatus('warning', 'subscriptions.subscription_endpoint_disabled', true, 5000);
                }
            }
        }
    };

    /**
     * Load Communication Channel data from a specific Organisation and Endpoint
     *
     * @memberOf SubscriptiontopformCtrl
     * @public
     * @alias loadCommChannels
     */
    $scope.loadCommChannels = function () {
        $scope.commChannelItems = [];
        $scope.checkForErrorMsg('endPoint');
        if (angular.isDefined($scope.subscription.endPoint)){
            if ($scope.subServ.layoutStatus.isNewSub === false && $scope.isLoadingFromJson === false){
                $scope.subscription.communicationChannel = undefined;
            }
            var filteredCommChannels = _.findWhere($scope.organisationDetails.endpoints, {endpointId : $scope.subscription.endPoint});
            setupCommChannelCombo(filteredCommChannels);
        }
    };

    /**
     * Setup the Communication Channel combobox items
     *
     * @memberOf SubscriptiontopformCtrl
     * @private
     * @param {Array} data - An array containing all communication channels belonging to a specific organisation and endpoint
     */
    var setupCommChannelCombo = function (data) {
        if (angular.isDefined(data.channelList) && data.channelList.length > 0){
            angular.forEach(data.channelList, function (item) {
                $scope.commChannelItems.push({'text': item.dataflow, 'code': item.channelId});
            });
        }


        if ($scope.commChannelItems.length === 0){
            if ($scope.subServ.layoutStatus.isNewSub === false && $scope.isLoadingFromJson === true){
                $scope.subscription.communicationChannel = undefined;
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_no_comm_channels', true, undefined, 'commChannel');
            }
        }

        if ($scope.subServ.layoutStatus.isNewSub === false && $scope.isLoadingFromJson === true){
            $scope.isLoadingFromJson = false;
            var rec = _.findWhere(data.channelList, {channelId : $scope.subscription.communicationChannel});
            if (angular.isUndefined(rec)){
                $scope.subscription.communicationChannel = undefined;
                if ($scope.commChannelItems.length > 0){
                    $scope.subServ.setAlertStatus('error', 'subscriptions.error_comm_channel_is_deleted', true, undefined, 'commChannel');
                }
            }
        }
    };

    /**
     * Check if there are visible error messages related with the combo type and clear them
     *
     * @memberOf SubscriptiontopformCtrl
     * @public
     * @alias checkForErrorMsg
     * @param {String} type - The alert invalid type
     */
    $scope.checkForErrorMsg = function (type) {
        if ($scope.subServ.getAlertInvalidType() === type){
            $scope.subServ.resetAlert();
        }
    };

    /**
     * Properly format the retry delay policy of a subscription, being sure that there is no comma at the end of the last input value
     *
     * @memberOf SubscriptiontopformCtrl
     * @public
     * @alias formatDelay
     */
    $scope.formatDelay = function () {
        if (angular.isDefined($scope.subscription.delay)){
            $scope.subscription.delay = $scope.subscription.delay.replace(/,\s*$/, "");
        }
    };

    $scope.$watch('subscription.name', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== oldVal && $scope.subServ.layoutStatus.isForm === true){
            $scope.subscriptionForm.subName.$setValidity('existingName', true);
            $scope.shouldCheckName = true;
        }
    });

    /**
     * Check if the Subscription name already exists in the database
     *
     * @memberOf SubscriptiontopformCtrl
     * @public
     * @alias checkName
     */
    $scope.checkName = function () {
        if ($scope.subServ.layoutStatus.isForm === true && angular.isDefined($scope.subscription.name) && angular.isDefined($scope.shouldCheckName) && $scope.shouldCheckName === true && $scope.subscriptionForm.subName.$valid === true){
            subscriptionsRestService.getSubscriptionByName($scope.subscription.name).then(function (response) {
                if (angular.isDefined(response.data)){
                    $scope.subscriptionForm.subName.$setValidity('existingName', false);
                } else {
                    $scope.subscriptionForm.subName.$setValidity('existingName', true);
                    $scope.shouldCheckName = false;
                }
            }, function (error) {
                $scope.subServ.setAlertStatus('error', 'subscriptions.error_validating_subscription_name', true, 5000);
            });
        }
    };

    $scope.$on('$destroy', function(){
        var elNames = ['startDate', 'endDate'];
        var endName = 'Form';
        if ($scope.subServ.layoutStatus.isForm === true){
            endName = 'Search';
        }
        angular.forEach(elNames, function(item){
            var elName = item + '-' + endName;
            angular.element('#' + elName).remove();
            angular.element('#picker-' + elName).remove();
        });
    });

    init();
});