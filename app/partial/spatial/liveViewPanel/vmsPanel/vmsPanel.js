angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale){
    $scope.selectedVmsTab = 'MOVEMENTS';
    
    //Define VMS tabs
    var setTabs = function(){
        return [
                {
                    'tab': 'MOVEMENTS',
                    'title': locale.getString('spatial.tab_movements')
                },
                {
                    'tab': 'SEGMENTS',
                    'title': locale.getString('spatial.tab_segments')
                }
            ];
        };
    
        
   locale.ready('spatial').then(function(){
       $scope.vmsTabMenu = setTabs();
   });
   
   $scope.selectVmsTab = function(tab){
       $scope.selectedVmsTab = tab;
   };
   
//   $scope.isVmsTabSelected = function(tab){
//       return $scope.selectedVmsTab === tab;
//   };

});