angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout, $state, $window, mapService, locale, reportService, reportFormService, reportRestService, loadingStatus, alertModalService){
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
        alertModalService.resizeModal();
    };
    
    $scope.tabClick = function( tab ) {
        $scope.tab = tab;
        setTabTitle();
    };
    
    $scope.getClassName = function(){
        var items = angular.element('.panel-component-item');
        return 'item-' + items.length;
    };
    
    $scope.isLastTreeItem = function(component){
        //Components might be: LayerBtns, ReportBtns, AreaBtns
        var className;
        var items = angular.element('.panel-component-item');
        if ((component === 'LayerBtns' && items.length === 0) || (component === 'ReportBtns' && items.length === 1) || (component === 'AreaBtns') && items.length === 2){
            className = 'is-last-tree-item';
        }
        
        return className;
    };
    
    $scope.isReportEditable = function(){
        return reportFormService.liveView.editable;
    };
    
    $scope.isReportDirty = function(){
        return reportFormService.liveView.editable && reportFormService.liveView.outOfDate;
    };
    
    $scope.goToAreas = function(){
        $state.go('app.areas');
    };
});
