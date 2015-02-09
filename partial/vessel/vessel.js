angular.module('unionvmsWeb').controller('VesselCtrl',function($scope, vessel){

    var onError = function(){
        $scope.error = "Error when retrieving vessels";
    };
    $scope.vessels = vessel.getVessels();
    $scope.checkAll = function(){
        if($scope.selectedAll)
        {
            $scope.selectedAll = false;
        }
        else
        {
            $scope.selectedAll = true;
        }
        angular.forEach($scope.vessels, function(item) {
            item.Selected = $scope.selectedAll;
        });
    };

    $scope.sortType = 'name';
    $scope.sortReverse = false;
    $scope.sortFilter = '';
});
