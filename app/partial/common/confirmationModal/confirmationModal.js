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
        vm.cancel = cancel;
        vm.commentsEnabled = options.commentsEnabled;
        vm.labels = {
            title: options.titleLabel || locale.getString("common.are_you_sure"),
            text: options.textLabel || locale.getString("common.are_you_sure"),
            confirm: options.confirmLabel || locale.getString("common.yes"),
            cancel: options.cancelLabel || locale.getString("common.cancel"),
        };

        function confirm() {
            vm.submitAttempted = true;
            if (!options.commentsEnabled || vm.commentForm.$valid) {
                $modalInstance.close(vm.comment);
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