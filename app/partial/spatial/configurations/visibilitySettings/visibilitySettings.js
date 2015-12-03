angular.module('unionvmsWeb').controller('VisibilitysettingsCtrl',function($scope, locale){
    
    $scope.status = {
        isOpen: false
    };
    
    $scope.selectedMenu = 'POSITIONS';

    var setMenus = function(){
            return [
                {
                    'menu': 'POSITIONS',
                    'title': locale.getString('spatial.tab_movements')
                },
                {
                    'menu': 'SEGMENTS',
                    'title': locale.getString('spatial.tab_segments')
                }
            ];
        };
        
    locale.ready('spatial').then(function(){
       $scope.headerMenus = setMenus();
    });
    
    $scope.selectMenu = function(menu){
       $scope.selectedMenu = menu;
    };
    
    $scope.isMenuSelected = function(menu){
       return $scope.selectedMenu === menu;
    };
});
