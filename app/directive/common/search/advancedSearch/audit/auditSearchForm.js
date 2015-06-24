angular.module('unionvmsWeb').controller('AuditsearchformCtrl',function($scope, locale){
	
	$scope.objectTypes = []; //Objecttype dropdown
	$scope.objectTypes.push({"text":"Assets", "code":"Assets"});
    $scope.objectTypes.push({"text":"Reports", "code":"Reports"});
    $scope.objectTypes.push({"text":"Mobile terminal", "code":"Mobile terminal"});
    $scope.objectTypes.push({"text":"Zone system", "code":"Zone system"});


	$scope.operations = []; //Operation dropdown
    $scope.operations.push({"text":"Create", "code":"Create"});
    $scope.operations.push({"text":"Update", "code":"Update"});
    $scope.operations.push({"text":"Remove", "code":"Remove"});
    
    $scope.selectedItems = [];

});