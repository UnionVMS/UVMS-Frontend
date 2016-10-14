angular.module('unionvmsWeb').controller('TripspanelCtrl',function($scope,tripSummaryService,Trip,spatialConfigAlertService){

    $scope.alert = spatialConfigAlertService;

    $scope.tabTitles = [
        {
            title: 'NOR-TRP-20160517234053706'
        },
        {
            title: 'NOR-TRP-20160517234053707'
        },
        {
            title: 'NOR-TRP-20160517234053708'
        }
    ];

    $scope.closeTab = function(index){
        $scope.tabTitles.splice(index,1);
        if($scope.tabTitles.length < 1){
            $scope.repNav.goToPreviousView();
        }
    };

    $scope.initializeTrip = function(index){
        if(angular.isDefined($scope.tabTitles[index])){
            tripSummaryService.trip = new Trip($scope.tabTitles[index].title);
            $scope.trip = tripSummaryService.trip;
        }
    };

});