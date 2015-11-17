angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource) {

	$resource("/config/rest/pings").get(function(response) {
		$scope.pings = response.data;
	});

	$scope.statusLabel = function(status) {
		return status.online ? 'config.online' : 'config.offline';
	};

});