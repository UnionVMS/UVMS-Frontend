angular.module('unionvmsWeb').controller('ReportspaginationCtrl',function($scope,$timeout){

    $scope.inputPage = 1;

    //Handle change in page input field
    var inputChangeCallbackTimeout;
    $scope.onInputPageChange = function(value){
        if(value){
            $scope.inputPage = value;
        }
        
        if($scope.inputPage >= 1 && $scope.inputPage <= $scope.numPages && $scope.inputPage !== $scope.currentPage){
            changeTimeout();
        }else if(!angular.isDefined($scope.inputPage) || $scope.inputPage === null){
            return;
        }else if($scope.inputPage < 1){
            $scope.inputPage = 1;
            changeTimeout();
        }else if($scope.inputPage > $scope.numPages){
            $scope.inputPage = $scope.numPages;
            changeTimeout();
        }else{
            $scope.inputPage = $scope.currentPage;
        }
    };

    var changeTimeout = function(){
        $timeout.cancel(inputChangeCallbackTimeout);
        inputChangeCallbackTimeout = $timeout(function(){
            $scope.selectPage($scope.inputPage);
        }, 300);
    };

    $scope.$watch('currentPage',function(newVal,oldVal) {
        if(newVal !== $scope.inputPage){
            $scope.inputPage = newVal;
        }
    });

});