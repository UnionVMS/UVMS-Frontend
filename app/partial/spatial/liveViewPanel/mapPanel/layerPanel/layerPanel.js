angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout,$window, mapService, locale, reportService, reportFormService){
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
    
    $scope.getClassName = function(){
        var items = angular.element('.panel-component-item');
        return 'item-' + items.length;
    };
    
    $scope.isReportEditable = function(){
        return reportFormService.liveView.editable;
    };
});
