angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource) {

	$resource("/config/rest/pings").get(function(response) {
		$scope.pings = response.data;
	});

	$scope.isOnline = function(timestamp) {
		return (new Date().getTime() - timestamp) < 6 * 60 * 1000;
	};
	
});