angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService) {

	$scope.performAdvancedSearch = function() {
		var aso = searchService.getAdvancedSearchObject();
		if ($scope.freeText) {
			aso.NAME = $scope.freeText + "*";
			aso.CFR = $scope.freeText + "*";
			aso.IRCS = $scope.freeText + "*";
		}
		else {
			delete aso.NAME;
			delete aso.CFR;
			delete aso.IRCS;
		}

		$scope.$parent.performAdvancedSearch();
	}

});
