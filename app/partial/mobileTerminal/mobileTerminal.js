angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope){

    $scope.isVisible = {
        search : true,
        addNewMobileTerminal : false,
    };


    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        console.log("search results!");
        console.log(vesselListPage);
    };

    $scope.toggleAddNewMobileTerminal = function(){
        $scope.isVisible.addNewMobileTerminal = !$scope.isVisible.addNewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;
    };    

    $scope.createNewMobileTerminal = function(){
        console.log("createNewMobileTerminal");
    };
});
