angular.module('unionvmsWeb').controller('VesselCtrl', function($scope, $http, vessel, savedsearches ){



   // $scope.vessels = vessel.getVessels();

    $scope.getInitialVessels = function(){
        var response = vessel.getVesselList()
            .then(onVesselSuccess, onError);
    };

    var onVesselSuccess = function(response){
        $scope.vessels = response.data.data;//.code;//.data.id;
    };
    var onError = function(response){
        $scope.error = "Opps, we are sorry... To err is human but to arr is pirate!!";
    };

    //to be removed
   /* $scope.checkVessels = function(){
       var response = vessel.getVesselList()
           .then(onVesselSuccess, onError);
        //$scope.error = response.data.id;
    };*/

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

    $scope.toogleAdvancedsearch = function(){
        $scope.showadvanced = ($scope.showadvanced == true ? false:true);
    };

    $scope.sortType = 'name';
    $scope.sortReverse = false;
    $scope.sortFilter = '';
    $scope.answer= "answer here"; //for testing only To Be Removed

});
