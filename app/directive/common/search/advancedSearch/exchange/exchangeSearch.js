angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale) {

	var DATE_CUSTOM = "Custom";

	$scope.timeSpanOptions = [{
		text:'24h',
		code:'24'
	},
	{
		text: locale.getString("config.EXCHANGE_TIME_SPAN_custom"),
		code: DATE_CUSTOM
	}];

	$scope.performAdvancedSearch = function() {
		if ($scope.freeText) {
			$scope.advancedSearchObject.NAME = $scope.freeText + "*";
			$scope.advancedSearchObject.CFR = $scope.freeText + "*";
			$scope.advancedSearchObject.IRCS = $scope.freeText + "*";
		}
		else {
			delete $scope.advancedSearchObject.NAME;
			delete $scope.advancedSearchObject.CFR;
			delete $scope.advancedSearchObject.IRCS;
		}

		$scope.$parent.performAdvancedSearch();
	};

	$scope.$watch("advancedSearchObject.FROM_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.TO_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.TIME_SPAN', function(newValue) {
		if (newValue && newValue !== DATE_CUSTOM) {
			delete $scope.advancedSearchObject.FROM_DATE;
			delete $scope.advancedSearchObject.TO_DATE;
		}
	});

});
