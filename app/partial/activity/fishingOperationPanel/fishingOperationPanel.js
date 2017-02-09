angular.module('unionvmsWeb').controller('FishingoperationpanelCtrl',function($scope,fishingActivityService,loadingStatus){

    $scope.faServ = fishingActivityService;
    
    var init = function(){
        $scope.faServ.getData('fishing_operation');
    };

    $scope.model = {
        title: "Fishing activity: Fishing operation",
        subTitle: "Fishing time",
        items: {
            occurence: 'yy-mm-dd hh:mm',
            vessel_activity: 'FSH - Fishing',
            no_operations: 4,
            fishery_type: 'Demersal',
            targetted_species: 'COD'
        },
        subItems: {
            duration: '10h'
        }
    };

    init();
});