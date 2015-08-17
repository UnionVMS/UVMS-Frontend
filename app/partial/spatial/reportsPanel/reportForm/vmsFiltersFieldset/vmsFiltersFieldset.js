angular.module('unionvmsWeb').controller('VmsfiltersfieldsetCtrl',function($scope){
    $scope.selectedVmsMenu = 'SIMPLE';
    
    $scope.vmsFilters = {
        selectionType : 'simple'
    };
    
    $scope.isVmsMenuVisible = function(type){
        return $scope.selectedVmsMenu === type;
    };
    
    $scope.toggleVmsMenuType = function(type){
        $scope.selectedVmsMenu = type;
    };
    
    
});