angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope){

    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        console.log("search results!");
        console.log(vesselListPage);
    };



});