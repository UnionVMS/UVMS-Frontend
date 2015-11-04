angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale) {

	$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;

	$scope.performAdvancedSearch = function() {
		//Searchable enums are... TRANSFER_INCOMING, DATE_RECEIVED_FROM, DATE_RECEIVED_TO, SENDER_RECEIVER, RECIPIENT, TYPE, STATUS
		if ($scope.freeText) {
			$scope.advancedSearchObject.SENDER_RECEIVER = $scope.freeText;
		}
		else {
			delete $scope.advancedSearchObject.SENDER_RECEIVER;
			delete $scope.advancedSearchObject.RECIPIENT;
		}

		$scope.$parent.performAdvancedSearch();
	};

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_FROM", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.EXCHANGE_EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_TO", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.EXCHANGE_TIME_SPAN', function(newValue) {
		if (newValue && newValue !== $scope.DATE_CUSTOM) {
			delete $scope.advancedSearchObject.DATE_RECEIVED_FROM;
			delete $scope.advancedSearchObject.DATE_RECEIVED_TO;
		}
	});

$scope.resetSearch();

});
