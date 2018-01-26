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
 * @ngdoc service
 * @name subscriptionsService
 * @param locale {Service} The angular locale service
 * @param $timeout {Service} The angular timeout service
 * @description
 *  Service to manage the layout and alert status of the subscriptions page
 */
angular.module('unionvmsWeb').factory('subscriptionsService',function(locale, $timeout) {

    var subscriptionsService = {
        layoutStatus: {
            isForm: false,
            isNewSub: true
        },
        resetLayout: function(){
            this.layoutStatus = {
                isForm: false,
                isNewSub: true
            };
        },
        alertStatus: {
            timer: undefined,
            type: undefined,
            msg: undefined,
            isVisible: false,
            invalidType: undefined
        },
        /**
         * Cancel existing alert timeout
         *
         * @memberOf subscriptionsService
         * @public
         * @alias cancelTimeout
         */
        cancelTimeout: function(){
            $timeout.cancel(this.alertStatus.timer);
            this.alertStatus.timer = undefined;
        },
        /**
         * Set the alert status
         *
         * @memberOf subscriptionsService
         * @public
         * @param {String} type - The alert type (e.g. error, success, info or warning)
         * @param {String} msg - The message to be shown in the alert (should be the locale key string)
         * @param {Boolean} visible - Whether the alert should be visible ot not
         * @param {Number} [timeout] - Optional closing alert timeout in miliseconds
         */
        setAlertStatus: function (type, msg, visible, timeout, invalidType) {
            if (angular.isDefined(this.alertStatus.timer)){
                this.cancelTimeout();
            }

            this.alertStatus = {
                type: type,
                msg: locale.getString(msg),
                isVisible: visible,
                invalidType: invalidType
            };

            if (angular.isDefined(timeout)){
                this.alertStatus.timer = $timeout(function(){
                    this.resetAlert();
                }.bind(this), timeout);
            }
        },
        /**
         * Reset the alert status
         *
         * @memberOf  subscriptionsService
         * @public
         */
        resetAlert: function () {
            this.setAlertStatus(undefined, undefined, false, undefined);
        },
        /**
         * Get the alert invalid type
         *
         * @memberOf subscriptionsService
         * @public
         * @returns {String} The alert invalid type or undefined
         */
        getAlertInvalidType: function(){
            return this.alertStatus.invalidType;
        }
    };

    return subscriptionsService;
});