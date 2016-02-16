(function() {

	angular.module('unionvmsWeb')
		.controller('incomingMovementsController', IncomingMovementsController);

	function IncomingMovementsController($scope, searchService, SearchResults, locale) {

		$scope.currentSearchResults = new SearchResults('time', true, locale.getString('movement.movement_search_error_result_zero_pages'));

		reloadList();

		function reloadList() {
			searchService.resetSearchCriterias();
			searchService.searchMovements().then(function(page) {
				$scope.currentSearchResults.updateWithNewResults(page, false);
			});
		}
	}

})();