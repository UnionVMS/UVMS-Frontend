angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource, locale) {

	$scope.searchResults = {
		loading: true,
		zeroResultsErrorMessage: locale.getString('config.no_pings_message')
	};

	$resource("/config/rest/pings").get(function(response) {
		$scope.searchResults.loading = false;
		$scope.searchResults.items = response.data;
		$scope.searchResults.showZeroResultsMessage = Object.keys(response.data).length === 0;
	});

	$scope.statusLabel = function(status) {
		return status.online ? 'config.online' : 'config.offline';
	};

});