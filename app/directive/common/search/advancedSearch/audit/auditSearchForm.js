angular.module('unionvmsWeb').controller('AuditsearchformCtrl',function($scope, locale, auditLogsDefaultValues, auditLogsTypeOptions) {

	$scope.objectTypes = auditLogsTypeOptions.options;

	$scope.operations = []; //Operation dropdown
	//$scope.operations = configurationService.getValue('AUDIT', 'OPERATIONS');
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