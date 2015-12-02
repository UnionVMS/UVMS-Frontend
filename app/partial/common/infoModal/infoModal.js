var app = angular.module('unionvmsWeb');

app.controller('infoModalCtrl', function($scope, $modalInstance, options, locale) {

    $scope.loading = false;
    $scope.labels = {
        title: options.titleLabel || '',
        text: options.textLabel || '',
        close: options.closeLabel || locale.getString("common.close"),
    };

    //Is there a promise that needs to be resolved before we have the text to show?
    if(angular.isDefined(options.textLabelPromise)){
        $scope.loading = true;
        options.textLabelPromise.then(
            function(textLabel){
                $scope.loading = false;
                $scope.labels.text = textLabel;
            },
            function(errorTextLabel){
                $scope.loading = false;
                $scope.labels.text = errorTextLabel;
            }
        );
    }

    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
});

app.factory('infoModal',function($modal){
    return {
        open :function(options){
            return $modal.open({
                templateUrl: 'partial/common/infoModal/infoModal.html',
                controller: 'infoModalCtrl',
                windowClass : "infoModal",
                size: "small",
                resolve: {
                    options: function() {
                        return options || {};
                    },
                }
            });
        }
    };

});
