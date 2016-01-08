angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource) {

	$scope.loading = true;
	$resource("/config/rest/pings").get(function(response) {
		$scope.pings = response.data;
		$scope.loading = false;
	});

	$scope.statusLabel = function(status) {
		return status.online ? 'config.online' : 'config.offline';
	};

});