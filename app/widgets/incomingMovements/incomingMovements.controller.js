(function() {

	angular.module('unionvmsWeb')
		.controller('incomingMovementsController', IncomingMovementsController);

	function IncomingMovementsController($scope, searchService, locale, $interval) {
		var vm = this;

		reloadList();

		var refreshInterval = $scope.refreshInterval || 10;
		vm.refreshTimer = $interval(reloadList, refreshInterval * 1000);

		$scope.$on('$destroy', function() {
			$interval.cancel(vm.refreshTimer);
			vm.refreshTimer = undefined;
			searchService.reset();
		});

		function reloadList() {
			searchService.reset();
			searchService.searchMovements().then(function(page) {
				$scope.currentSearchResults = page;
			});
		}
	}

})();