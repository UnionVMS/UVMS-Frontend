angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, $timeout, $window, locale, mapService, reportService, $compile){
    $scope.selectedTab = 'MAP';
    
    $scope.selectHistory = function(item){
        var report = angular.copy(item);
        delete report.code;
        delete report.text;
        $scope.repServ.runReport(report);
    };

    $scope.initComboHistory = function(comboId){
        var comboFooter = angular.element('<li class="combo-history-footer"><div class="footer-item" ng-click="openReportList($event)"><span>Edit List</span></div><div class="footer-item" ng-click="createReportFromLiveview($event)"><span>Create new</span></div></li>');
        angular.element('#' + comboId + '>.dropdown-menu').append(comboFooter);
        $compile(comboFooter)($scope);
    };
    
   //Focus map div
   $scope.focusMap = function(){
       var mapElement = $window.document.getElementById('map');
       if(mapElement){
           mapElement.focus();
       }
   };
   
   $scope.$watch('repServ.tabs.map', function(newVal, oldVal){
      if (newVal){
          $timeout(mapService.updateMapContainerSize(), 100);
          $timeout($scope.focusMap, 50);
      } 
   });
});