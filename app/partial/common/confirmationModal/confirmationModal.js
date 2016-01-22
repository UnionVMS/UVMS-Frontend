var app = angular.module('unionvmsWeb');

app.controller('confirmationModalCtrl', function($scope, $modalInstance, options, locale) {

    var vm = this;

    vm.labels = {
        title: options.titleLabel || locale.getString("common.are_you_sure"),
        text: options.textLabel || locale.getString("common.are_you_sure"),
        confirm: options.confirmLabel || locale.getString("common.yes"),
        cancel: options.cancelLabel || locale.getString("common.cancel"),
    };

    this.commentsEnabled = options.commentsEnabled;

    this.confirm = function() {
        vm.submitAttempted = true;
        if(!options.commentsEnabled || vm.commentForm.$valid) {
            $modalInstance.close(vm.comment);
        }
    };

    this.cancel = function() {
        $modalInstance.dismiss();
    };
});

app.factory('confirmationModal',function($modal){
    return {
        open :function(callback, options){
            var modalInstance = $modal.open({
                templateUrl: 'partial/common/confirmationModal/confirmationModal.html',
                controller: 'confirmationModalCtrl as modal',
                windowClass : "confirmationModal",
                backdrop: 'static', //will not close when clicking outside the modal window
                size: "small",
                resolve: {
                    options: function() {
                        return options || {};
                    }
                }
            }).result.then(callback);
        }  
    };

});
    