angular.module('unionvmsWeb').controller('DatasetlistmodalCtrl',function($scope,$modalInstance,area){
	$scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.save = function(){
        $modalInstance.close($scope.exportSelectedAreas());
    };
    
    $modalInstance.opened.then(function(){
        $scope.selectedTab = 'SYSTEM';
        $scope.sysSelection = "map";
        $scope.userSelection = "map";
        $scope.clickResults = 0;
        $scope.showWarning = false;
        $scope.warningMessage = undefined;
        $scope.hasError = false;
        $scope.errorMessage = undefined;
    });
    
    var
    areaRestService.getDatasets({areaGid: area.areaGid, areaType: area.areaType}).then(function(){
		
	}, function(error){
		
	});

});