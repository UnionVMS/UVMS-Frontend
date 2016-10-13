angular.module('unionvmsWeb').controller('CatchpanelCtrl',function($scope,$element,loadingStatus,activityRestService,tripSummaryService,$anchorScroll,locale){

    $scope.chartColors = ['#089fd7', '#6fc474'];

    /* Chart options */
    $scope.options = {
        chart: {
            type: 'pieChart',
            height: 200,
            x: function(d){return d.key;},
            y: function(d){return d.count;},
            valueFormat: function(d){
                var value = d/$scope.total*100;
                return value.toFixed(2) + '%';
            },
            showLabels: false,
            duration: 500,
            legend: {
                margin: {
                    top: 15,
                    right: 20,
                    bottom: 0,
                    left: 0
                }
            }
        }
    };

    loadingStatus.isLoading('TripSummary', true);
    activityRestService.getTripCatches($scope.trip.id).then(function(response){
        $scope.trip.fromJson('catch',response.data);
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

    //to resize the chart after it's loaded
    $scope.callback = function(scope, element){
        scope.api.refresh();
    };

    $scope.$watch('tab.active',function(newVal,oldVal){
        if(newVal){
            $scope.api.refresh();
        }
    });

    $scope.isTabActive = function(){
        if($.contains(angular.element('.tab-pane.active')[0],$element["0"].parentElement)){
            return true;
        }else{
            return false;
        }
    };

});