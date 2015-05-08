angular.module('unionvmsWeb').controller('MobileterminallistCtrl',function($scope){

    $scope.checkAll = function(){

        /*TODO: REFACTOR THIS WHEN WE KNOW WHAT WE SHOULD DO WITH IT
        if($scope.selectedAll)
        {
            $scope.selectedAll = false;

            delete $scope.selectedMobileTerminals;
            angular.forEach($scope.currentSearchResults.mobileTerminals, function(item) {
                item.Selected = $scope.selectedAll;
            });
        } else {
            $scope.selectedAll = true;
            $scope.selectedMobileTerminals = [];
            angular.forEach($scope.currentSearchResults.mobileTerminals, function(item) {
                item.Selected = $scope.selectedAll;
                $scope.selectedMobileTerminals.push(item.vesselId.value);
            });
        }*/
        console.log("CHECKED ALL CLICKED!");
    };

    $scope.showLog = function (item){
        console.log("Show log info for this item:");
        console.log(item);
    };

    $scope.mobileTerminalChecked = function(item){
    /*TODO: REFACTOR THIS WHEN WE KNOW WHY WE SHOULD BE ABLE TO CHECK IT
        $scope.selectedMobileTerminals = [];
        item.Selected = !item.Selected;
        angular.forEach($scope.currentSearchResults.vessels, function(item) {
            if(item.Selected){
                $scope.selectedMobileTerminals.push(item.vesselId.value);
            }
        });
        */
        console.log("MOBILE TERMINAL IS CHECKED");
    };

     $scope.sortType = 'associatedVessel.name';

});
