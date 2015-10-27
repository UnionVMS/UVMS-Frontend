angular.module('unionvmsWeb').controller('AuditsearchformCtrl',function($scope, locale, auditOptionsService) {

	$scope.objectTypes = auditOptionsService.getCurrentOptions().types;

	$scope.operations = auditOptionsService.getCurrentOptions().operations;

	$scope.member = {
		operations:[],
		objecttypes:[]
	};

	$scope.resetSearch = function() {
        $scope.resetAdvancedSearchForm(false);
        auditOptionsService.resetDefaults();
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