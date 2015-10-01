angular.module('unionvmsWeb').controller('VesselhistorymodalCtrl',function($scope, $modalInstance, vesselHistory, locale){

    $scope.vesselHistory = vesselHistory;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

});

angular.module('unionvmsWeb').filter('vesselHistoryReplaceEmptyValueWithDash', function(locale) {
    return function(input) {
        if(input == null || angular.isUndefined(input) || (typeof input === 'string' && input.trim().length === 0)){
            return '-';
        }
        return input;
    };
});