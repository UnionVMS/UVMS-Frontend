angular.module('unionvmsWeb').controller('DatasetlistmodalCtrl',function($scope,$modalInstance,area,areaRestService){
	$scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.save = function(){
        $modalInstance.close($scope.exportSelectedAreas());
    };
    
    $modalInstance.opened.then(function(){
    	areaRestService.getDatasets({areaGid: area.areaGid, areaType: area.areaType}).then(function(){
    		
    	}, function(error){
    		
    	});
    });
    
});