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
    
    $scope.toggleSelectedVmsFilter = function(selecetedRadio) {
    	if ('hasPositionsFilter' === selecetedRadio) {
    		$scope.report.hasSegmentsFilter = false;
    		$scope.report.hasTracksFilter = false;
    		$scope.report.vmsFilters.segments = {};
    		$scope.report.vmsFilters.tracks = {};
    	} else if ('hasSegmentsFilter' === selecetedRadio) {
    		$scope.report.hasPositionsFilter = false;
    		$scope.report.hasTracksFilter = false;
    		$scope.report.vmsFilters.positions = {};
    		$scope.report.vmsFilters.tracks = {};
    	} else {
    		$scope.report.hasSegmentsFilter = false;
    		$scope.report.hasPositionsFilter = false;
    		$scope.report.vmsFilters.positions = {};
    		$scope.report.vmsFilters.segments = {};
    	}
    };
    
});