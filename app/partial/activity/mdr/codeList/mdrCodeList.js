angular.module('unionvmsWeb').controller('MdrcodelistCtrl',function($scope, $modalInstance, acronym, mdrService){

    $scope.mdrCodeList = [];
    $scope.displayedMdrCodeList = [];
    $scope.allColumns = [];
    $scope.acronym = acronym;
    $scope.tableLoading = true;

    $scope.init = function() {
        mdrService.getMDRCodeListByAcronym(acronym).then(loadSuccess, loadFailed);
    };

    var loadSuccess = function(response) {
        if (angular.isDefined(response) && response.length > 0 ) {
            $scope.mdrCodeList = response;
            $scope.displayedMdrCodeList = [].concat($scope.mdrCodeList);
            $scope.allColumns = _.allKeys($scope.mdrCodeList[0]);
         }
         $scope.tableLoading = false;
    };

    var loadFailed = function(error) {
        //TODO
        $scope.tableLoading = false;
    };

    $scope.init();

    $scope.close = function() {
        $modalInstance.close();
    };
});
