angular.module('unionvmsWeb').controller('CatchpanelCtrl',function($scope,$element){

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

    $scope.total = 74747 + 45454;

    /* Chart data */
    $scope.data = [
        {
            key: "SOL",
            count: 74747
        },
        {
            key: "COD",
            count: 45454
        }
    ];

    //to resize the chart after it's loaded
    $scope.callback = function(scope, element){
        scope.api.refresh();
        //$(window).trigger('resize');
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