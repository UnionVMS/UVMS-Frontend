angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale, configurationService) {

	var init = function(){
	    $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.resetSearch();
        $scope.recipientItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'RECIPIENT'), 'RECIPIENT', 'EXCHANGE', true);
    };

    $scope.$on("resetExchangeLogSearch", function() {
    	$scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_FROM", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
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

    init();
});
