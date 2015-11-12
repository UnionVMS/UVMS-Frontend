angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource) {

	$resource("/config/rest/pings").get(function(response) {
		$scope.pings = response.data;
	});

});