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
angular.module('unionvmsWeb').controller('SpatialCtrl',function($scope, $timeout, locale, mapService, spatialHelperService, reportRestService, reportService, $anchorScroll, userService, loadingStatus, $state, $localStorage, comboboxService){
    $scope.isMenuVisible = true;
    $scope.selectedMenu = 'REPORTS';
    $scope.reports = [];
    $scope.executedReport = {};
    $scope.repServ = reportService;
    $scope.loadingStatus = loadingStatus;
    $scope.currentContext = userService.getCurrentContext();
    $scope.comboServ = comboboxService;
    
    //reset repServ
    $scope.repServ.clearVmsData();
    $scope.repServ.name = locale.getString('spatial.header_live_view');
    $scope.repServ.liveviewEnabled = false;
    
    //Define header menus
    var setMenus = function(){
    	if($state.current.name === 'app.reporting-id'){
    		return [
    	            {
    	                'menu': 'LIVEVIEW',
    	                'title': $scope.repServ.name,
    	                'visible': $scope.repServ.liveviewEnabled
    	            }
    	        ];
    	}else{
	    	return [
	            {
	                'menu': 'LIVEVIEW',
	                'title': $scope.repServ.name,
	                'visible': $scope.repServ.liveviewEnabled
	            },
	            {
	                'menu': 'REPORTS',
	                'title': locale.getString('spatial.header_reports'),
	                'visible': true
	            }
	        ];
    	}
    };
        
   locale.ready('spatial').then(function(){
       //reset the map and remove references to it
       if (angular.isDefined(mapService.map)){
           mapService.map.setTarget(null);
           mapService.map = undefined;
       }
       
       $scope.curState = $state.current.name;
       if($state.current.name === 'app.reporting-id'){
    	   spatialHelperService.tbControl.newTab = false;
    	   $scope.selectedMenu = 'LIVEVIEW';
           $scope.repServ.liveviewEnabled = true;
           $scope.repServ.isReportExecuting = true;
           loadingStatus.isLoading('LiveviewMap',true);
           
           if(angular.isDefined($localStorage['report'+$state.params.id + '-' + $state.params.guid])){
        	   reportService.runReportWithoutSaving($localStorage['report' + $state.params.id + '-' + $state.params.guid]);
        	   delete $localStorage['report'+$state.params.id + '-' + $state.params.guid];
           }else{
	           reportRestService.getReport($state.params.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               $scope.selectedMenu = 'REPORTS';
	               $scope.repServ.liveviewEnabled = false;
	               $scope.repServ.isReportExecuting = false;
	               $scope.repServ.errorLoadingDefault = true;
	           });
           }
       }else{
	       //let's check for the existence of default reports
	       var defaultRepObj = spatialHelperService.getDefaultReport(true);
	       if (angular.isDefined(defaultRepObj) && !_.isNaN(defaultRepObj.id) && defaultRepObj.id !== 0){
	           $scope.selectedMenu = 'LIVEVIEW';
	           $scope.repServ.liveviewEnabled = true;
	           $scope.repServ.isReportExecuting = true;
	           loadingStatus.isLoading('LiveviewMap',true);
	           reportRestService.getReport(defaultRepObj.id).then(function(response){
	               $scope.repServ.runReport(response);
	           }, function(error){
	               $scope.selectedMenu = 'REPORTS';
	               $scope.repServ.liveviewEnabled = false;
	               $scope.repServ.isReportExecuting = false;
	               $scope.repServ.errorLoadingDefault = true;
	           });
	       }
       }
       $scope.headerMenus = setMenus();
   });
   
   $scope.selectMenu = function(menu){
       $scope.selectedMenu = menu;
   };
   
   $scope.isMenuSelected = function(menu){
       return $scope.selectedMenu === menu;
   };
   
   $scope.toggleMenuVisibility = function(){
       $scope.isMenuVisible = !$scope.isMenuVisible;
   };
   
   $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
   };
   
   //Report filter definitions
   $scope.editReport = function(){
	   $scope.repServ.isReportExecuting = true;
	   if(!$scope.repServ.outOfDate){
	       reportRestService.getReport($scope.repServ.id).then(getReportSuccess, getReportError);
	   }else{
		   $scope.$broadcast('goToReportForm','EDIT-FROM-LIVEVIEW');
	   }
   };

   //Create new report from liveview
   $scope.createReportFromLiveview = function(evt){
       $scope.comboServ.closeCurrentCombo(evt);
       $scope.$broadcast('goToReportForm','CREATE');
   };
   
   //Get Report Configs Success callback
   var getReportSuccess = function(response){
	   $scope.$broadcast('openReportForm', {'report': response});
       $scope.$broadcast('goToReportForm','EDIT');
   };
	   
   //Get Report Configs Failure callback
   var getReportError = function(error){
	   $scope.repServ.isReportExecuting = false;
       $anchorScroll();
       $scope.repServ.alertType = 'danger';
       $scope.repServ.hasAlert = true;
       $scope.repServ.message = locale.getString('spatial.error_entry_not_found');
   };
   
   //Refresh map size on menu change
   $scope.$watch('selectedMenu', function(newVal, oldVal){
       if (newVal === 'LIVEVIEW'){
           $timeout(mapService.updateMapSize, 100);
           mapService.updateMapContainerSize();  
           $scope.repServ.isLiveViewActive = true;   
       } else if  (newVal === 'REPORTS'){
           if ($scope.reports.length === 0){
               $scope.$broadcast('loadReportsList');
           }
           $scope.$broadcast('untoggleToolbarBtns');
           $scope.repServ.isLiveViewActive = false;
       }else {
    	   $scope.$broadcast('loadUserPreferences', oldVal);
    	   $scope.repServ.isLiveViewActive = false;
       }
   });
   
   //Change tab to liveview when a user has clicked in run report in the reports page
   $scope.$on('runReport', function(event, report){
       $scope.selectMenu('LIVEVIEW');
       //Getting report data
       $scope.repServ.runReport(report);
   });
   
   $scope.$watch(function(){return $scope.repServ.name;}, function(newValue, oldValue){
       if (newValue !== oldValue){
           $scope.headerMenus[0].title = newValue;
       }
   });
   
   $scope.$watch(function(){return $scope.repServ.liveviewEnabled;}, function(newValue, oldValue){
       if (newValue !== oldValue){
           $scope.headerMenus[0].visible = newValue;
       }
   });
   
   $scope.$on('closeUserPreferences', function(event, lastSelected){
       $scope.selectMenu(lastSelected);
   });
   
   $scope.$on('goToLiveView', function(event, lastSelected){
	   $scope.selectMenu('LIVEVIEW');
   });
});