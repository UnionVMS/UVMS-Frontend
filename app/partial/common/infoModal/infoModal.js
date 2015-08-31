var app = angular.module('unionvmsWeb');

app.controller('infoModalCtrl', function($scope, $modalInstance, options, locale) {

    $scope.labels = {
        title: options.titleLabel || '',
        text: options.textLabel || '',
        close: options.closeLabel || locale.getString("common.close"),
    };

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
});

app.factory('infoModal',function($modal){
    return {
        open :function(options){
            var modalInstance = $modal.open({
                templateUrl: 'partial/common/infoModal/infoModal.html',
                controller: 'infoModalCtrl',
                windowClass : "infoModal",
                size: "small",
                resolve: {
                    options: function() {
                        return options || {};
                    }
                }
            });
        }  
    };

});
