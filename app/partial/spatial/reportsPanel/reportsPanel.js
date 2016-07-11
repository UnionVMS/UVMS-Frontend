/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('ReportspanelCtrl',function($scope, $anchorScroll, reportService){
    
    $scope.isVisible = {
            reportsList: true,
            reportForm: false
    };
    
    $scope.editMode = 'CREATE';
    
    $scope.toggleReportForm = function(mode, report){
    	
        $scope.isVisible.reportsList = !$scope.isVisible.reportsList;
        $scope.isVisible.reportForm = !$scope.isVisible.reportForm;
        $anchorScroll();
        
        //Call function from parent to toggle menu visibility
        $scope.toggleMenuVisibility();
        
        if($scope.editMode === 'EDIT-FROM-LIVEVIEW' && mode === 'CLOSE'){
            $scope.$emit('goToLiveView');
            return;
        }else if($scope.editMode !== 'EDIT-FROM-LIVEVIEW' && mode === 'CLOSE'){
        	mode = undefined;
        }
        
        $scope.editMode = mode;
        if ($scope.editMode === 'CREATE'){
            $scope.$broadcast('openReportForm');
        } else if ($scope.editMode === 'EDIT') {
            $scope.$broadcast('openReportForm', {report: report});
        }
    };
    
    $scope.reloadReportsList = function(){
        $scope.$broadcast('loadReportsList');
    };
    
    $scope.$on('reloadReportsList', function(){
        $scope.reloadReportsList();
    });
    
    $scope.$on('goToReportForm', function(evt, mode){
		$scope.editMode = mode;
		$scope.isVisible.reportsList = false;
        $scope.isVisible.reportForm = true;
        
        setTimeout(function() {
        	$scope.selectMenu('REPORTS');
        	//Call function from parent to toggle menu visibility
            $scope.toggleMenuVisibility();
            if($scope.editMode === 'CREATE'){
                $scope.$broadcast('openReportForm');
            }else{
                $scope.$broadcast('openReportForm', {isLoaded: true});
            }
            reportService.isReportExecuting = false;
        });
    });
    
});