angular.module('unionvmsWeb').controller('VesselhistorymodalCtrl',function($scope, $modalInstance, vesselHistory, locale){

    $scope.vesselHistory = vesselHistory;

    $scope.gearType = undefined;
    $scope.licenseType = undefined;
    if(angular.isDefined(vesselHistory.gearType)){
        $scope.gearType = locale.getString('config.VESSEL_GEAR_TYPE_' +vesselHistory.gearType);
        if($scope.gearType.indexOf('KEY_NOT_FOUND') >= 0){
            $scope.gearType = vesselHistory.gearType;
        }
    }

    if(angular.isDefined(vesselHistory.licenseType)){
        $scope.licenseType = locale.getString('config.VESSEL_LICENSE_TYPE_' +vesselHistory.licenseType);
        if($scope.licenseType.indexOf('KEY_NOT_FOUND') >= 0){
            $scope.licenseType = vesselHistory.licenseType;
        }
    }

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