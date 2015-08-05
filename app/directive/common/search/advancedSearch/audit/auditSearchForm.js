angular.module('unionvmsWeb').controller('AuditsearchformCtrl',function($scope, locale, auditLogsDefaultValues){

	$scope.objectTypes = []; //Objecttype dropdown
	$scope.objectTypes.push({"text":"Asset", "code":"Asset"});
	$scope.objectTypes.push({"text":"Reports", "code":"Reports"});
	$scope.objectTypes.push({"text":"Mobile Terminal", "code":"Mobile Terminal"});
	$scope.objectTypes.push({"text":"Zone system", "code":"Zone system"});


	$scope.operations = []; //Operation dropdown
	$scope.operations.push({"text":"Create", "code":"Create"});
	$scope.operations.push({"text":"Update", "code":"Update"});
	$scope.operations.push({"text":"Remove", "code":"Remove"});

	$scope.member = {
		operations:[],
		objecttypes:[]
	};

	$scope.resetSearch = function() {
        $scope.resetAdvancedSearchForm(false);
        auditLogsDefaultValues.resetDefaults();
        $scope.performAdvancedSearch();
	};

	$scope.performAdvancedSearch = function() {
		$scope.submitAttempted = true;
		if (!$scope.advancedSearchForm.$valid) {
			return false;
		}

		$scope.$parent.performAdvancedSearch();
	};
});