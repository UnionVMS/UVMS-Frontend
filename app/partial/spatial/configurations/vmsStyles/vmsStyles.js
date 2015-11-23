angular.module('unionvmsWeb').controller('VmsstylesCtrl',function($scope, reportConfigRestService){

	$scope.positionStyles = [];
	$scope.itemsByPage = 25;
	$scope.searchString = '';
	
	$scope.positionStyles = [
	    {
	    	code: "HDO",
	    	color: "#ddd"
	    },
	    {
	    	code: "RDO",
	    	color: "#000"
	    }
	];
    $scope.displayedRecords = [].concat($scope.positionStyles);
	
//	reportConfigRestService.getCountriesList().then(getCountriesListSuccess, getCountriesListError);
//	
//	var getCountriesListSuccess = function(positionStyles){
//        $scope.positionStyles = positionStyles.data;
//        $scope.isLoading = false;
//    };
//    
//    //Get Country List Failure callback
//    var getCountriesListError = function(error){
//        $scope.isLoading = false;
//        var msg = locale.getString('spatial.error_get_countries_list');
//        $scope.alert.show(msg, 'error');
//        $scope.positionStyles = [];
//    };
});