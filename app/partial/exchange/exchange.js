angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, searchService, exchangeRestService){

	$scope.searchResults = {
		page: 0,
		pageCount: 0,
		messages: [],
		sortBy: "dateReceived",
		sortReverse: true,
		errorMessage: "",
		incomingOutgoing: "all"
	};

	$scope.filterIncomingOutgoing = function(message) {
		if ($scope.searchResults.incomingOutgoing === "all") {
			return true;
		}

		return message.outgoing ? $scope.searchResults.incomingOutgoing === "outgoing" : $scope.searchResults.incomingOutgoing === "incoming";
	};

	$scope.searchExchange = function() {
		searchService.searchExchange().then(function(page) {
			$scope.searchResults.messages = page.exchangeMessages;
			$scope.searchResults.page = page.currentPage;
			$scope.searchResults.pageCount = page.totalNumberOfPages;
			$scope.searchResults.errorMessage = "";
		},
		function(error) {
			$scope.searchResults.errorMessage = error;

		});
	};

	$scope.searchExchange();
});
