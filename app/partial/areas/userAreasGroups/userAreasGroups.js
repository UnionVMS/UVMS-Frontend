angular.module('unionvmsWeb').controller('UserareasgroupsCtrl',function($scope, locale, areaRestService){
	$scope.userAreasGroups = [];
	$scope.displayedGroups = [].concat($scope.userAreasGroups); 
	$scope.tableLoading = false;

	$scope.init = function() {
		$scope.getUserAreasGroupsList();
	};

 //USER AREAS GROUPS LIST
    $scope.getUserAreasGroupsList = function(){
        $scope.tableLoading = true;
        areaRestService.getUserAreaTypes().then(function(response){
        	if (angular.isDefined(response)) {
        		$scope.userAreasGroups = response;
        		$scope.displayedGroups = [].concat($scope.userAreasGroups);
        	}
           
        }, function(error){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_userarea_types');
            $scope.alert.hideAlert();
        });
        $scope.tableLoading = false;
    };
    

	locale.ready('areas').then(function(){
        $scope.init();
    });
});