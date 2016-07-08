angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout,$window, mapService, locale){
    $scope.expanded = true;
    $scope.tab = "LAYERTREE";
    $scope.tabTitle = undefined;
    
    locale.ready('spatial').then(function(){
         setTabTitle();
    });

    var setTabTitle = function(){
        switch ($scope.tab) {
            case 'LEGEND':
                $scope.tabTitle = locale.getString('spatial.layer_panel_legend');
                break;
            case 'COPYRIGHT':
                $scope.tabTitle = locale.getString('spatial.layer_panel_copyright');
                break;
            default:
                $scope.tabTitle = locale.getString('spatial.layer_panel_layers');
                break;
        }
    };
    
    $scope.switchCollapse = function(){
        $scope.expanded = !$scope.expanded;
    };
    
    $scope.tabClick = function( tab ) {
        $scope.tab = tab;
        setTabTitle();
    };
});
