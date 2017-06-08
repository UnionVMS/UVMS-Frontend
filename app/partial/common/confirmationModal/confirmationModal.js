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
(function() {
    'use strict';

    angular
        .module('unionvmsWeb')
        .controller('confirmationModalCtrl', ConfirmationModalController);

    angular
        .module('unionvmsWeb')
        .factory('confirmationModal', ConfirmationModalFactory);

    /* @ngAnnotate */
    function ConfirmationModalController($modalInstance, options, locale) {
        var vm = this;
        vm.confirm = confirm;
        vm.discard = options.discard ? confirm : undefined;
        vm.cancel = cancel;
        vm.commentsEnabled = options.commentsEnabled;
        vm.labels = {
            title: options.titleLabel || locale.getString("common.are_you_sure"),
            text: options.textLabel || locale.getString("common.are_you_sure"),
            confirm: options.confirmLabel || locale.getString("common.yes"),
            discard: options.discardLabel || locale.getString("common.discard"),
            cancel: options.cancelLabel || locale.getString("common.cancel"),
        };

        function confirm(discard) {
            vm.submitAttempted = true;
            if (!options.commentsEnabled || vm.commentForm.$valid) {
                $modalInstance.close(vm.comment || discard);
            }
        }

        function cancel() {
            $modalInstance.dismiss();
        }
    }

    /* @ngAnnotate */
    function ConfirmationModalFactory($modal) {

        function openInstance(options) {
            return $modal.open({
                templateUrl: 'partial/common/confirmationModal/confirmationModal.html',
                controller: 'confirmationModalCtrl',
                controllerAs: 'modal',
                windowClass : "confirmationModal",
                backdrop: 'static', //will not close when clicking outside the modal window
                size: "small",
                resolve: {
                    options: function() {
                        return options || {};
                    }
                }
            });
        }

        return {
            openInstance: openInstance,
            open: function(callback, options) {
                openInstance(options).result.then(callback);
            }
        };
    }
})();