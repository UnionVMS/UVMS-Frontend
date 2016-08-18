angular.module('unionvmsWeb').controller('MdrcodelistCtrl',function($scope, $modalInstance, acronym, mdrRestService, $timeout){

    $scope.displayedMdrCodeList = [];
    $scope.allColumns = [];
    $scope.acronym = acronym;
    $scope.tableLoading = true;
    $scope.searchFilter = '';
    $scope.tableState = null;

    $scope.close = function() {
        $modalInstance.close();
    };

    $scope.callServer = function callServer(tableState) {
        $scope.tableState = tableState;
        $scope.tableLoading = true;

        mdrRestService.getMDRCodeListByAcronym(acronym, tableState).then(function (result) {
            if (angular.isDefined(result) && result.length > 0 ) {
                $scope.allColumns = _.allKeys(result[0]);
                $scope.displayedMdrCodeList = result;
             }

            $scope.tableLoading = false;
          });
    };

    $scope.$watch('searchFilter', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== ''){
            $scope.tableLoading = true;
            if ($scope.requestTimer){
                $timeout.cancel($scope.requestTimer);
            }

            $scope.requestTimer = $timeout(function(){
                $scope.tableState.search.predicateObject = newVal;
                $scope.callServer($scope.tableState);
            }, 1500, true, $scope);
        } else {
            $scope.searchFilter = '';
        }
    });
});
