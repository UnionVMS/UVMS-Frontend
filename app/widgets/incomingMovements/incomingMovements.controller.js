(function() {

	angular.module('unionvmsWeb')
		.controller('incomingMovementsController', IncomingMovementsController);

	function IncomingMovementsController($scope, searchService, SearchResults, locale, $interval) {
		var vm = this;
		$scope.currentSearchResults = new SearchResults('time', true, locale.getString('movement.movement_search_error_result_zero_pages'));

		reloadList();

		var refreshInterval = $scope.refreshInterval || 10;
		vm.refreshTimer = $interval(reloadList, refreshInterval * 1000);

		$scope.$on('$destroy', function() {
			$interval.cancel(vm.refreshTimer);
			vm.refreshTimer = undefined;
		});

		function reloadList() {
			searchService.resetSearchCriterias();
			searchService.searchMovements().then(function(page) {
				$scope.currentSearchResults.updateWithNewResults(page, false);
			});
		}
	}

})();