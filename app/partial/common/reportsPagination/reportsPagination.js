angular.module('unionvmsWeb').controller('ReportspaginationCtrl',function($scope,$timeout){

    $scope.inputPage = 1;

    //Handle change in page input field
    var inputChangeCallbackTimeout;
    $scope.onInputPageChange = function(){
        $timeout.cancel(inputChangeCallbackTimeout);
        inputChangeCallbackTimeout = $timeout(function(){
            if($scope.inputPage >= 1 && $scope.inputPage <= $scope.numPages && $scope.inputPage !== $scope.currentPage){
                $scope.selectPage($scope.inputPage);
            }else{
                $scope.inputPage = $scope.currentPage;
            }
        }, 300);
    };

});