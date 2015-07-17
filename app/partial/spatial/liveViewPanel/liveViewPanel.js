angular.module('unionvmsWeb').controller('LiveviewpanelCtrl',function($scope, locale){
    $scope.selectedTab = 'MAP';
    
    //Define tabs
    var setTabs = function(){
            return [
                {
                    'tab': 'MAP',
                    'title': locale.getString('spatial.tab_map')
                },
                {
                    'tab': 'VMS',
                    'title': locale.getString('spatial.tab_vms')
                }
            ];
        };
        
   locale.ready('spatial').then(function(){
       $scope.tabMenu = setTabs();
   });
   
   $scope.selectTab = function(tab){
       $scope.selectedTab = tab;
   };
   
   $scope.isTabSelected = function(tab){
       return $scope.selectedTab === tab;
   };

});