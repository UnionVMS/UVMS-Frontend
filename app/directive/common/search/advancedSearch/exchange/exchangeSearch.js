angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale) {

	$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;

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

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.FROM_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.TO_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.TIME_SPAN', function(newValue) {
		if (newValue && newValue !== $scope.DATE_CUSTOM) {
			delete $scope.advancedSearchObject.FROM_DATE;
			delete $scope.advancedSearchObject.TO_DATE;
		}
	});

});
