/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').controller('LayerpanelCtrl', function($scope, $timeout, $state, $window, mapService, locale, reportService, reportFormService, reportRestService, loadingStatus, alertModalService){
    $scope.expanded = true;
    $scope.tab = "LAYERTREE";
    $scope.tabTitle = undefined;
    $scope.loadingStatus = loadingStatus;
    $scope.exportSettings = {
        identifierForExport: 'CFR'
    };
    
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
    
    $scope.getValueInDropdownForm = function(value) {
        return {'text' : value, 'code' : value};
    };
    
    $scope.identifiersForExport = [$scope.getValueInDropdownForm("CFR"), $scope.getValueInDropdownForm("IRCS"), $scope.getValueInDropdownForm("UVI"), $scope.getValueInDropdownForm("Ext. Marking"), $scope.getValueInDropdownForm("ICCAT")];
        
    $scope.exportSelectedFeatures = function () {
        var features = mapService.getSelectedFeaturesForExport($scope.exportSettings.identifierForExport);
        loadingStatus.isLoading('ExportSelections', true, 0);
        reportRestService.export(features).then(function (data) {
            if(data) {
                var file = new Blob([data], {type: 'application/xml;charset=UTF-8'});
                $window.saveAs(file, "kmlExport" + moment().format("YYYY-MM-DDTHH:mm") + ".kml");
            }
            loadingStatus.isLoading('ExportSelections',false);
        }, function (error) {
            loadingStatus.isLoading('ExportSelections',false);
        });
    };
    
    $scope.checkIfSelectedFeatures = function() {
        return mapService.getSelectedFeatures().length > 0;
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
