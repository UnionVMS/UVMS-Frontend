(function() {
	'use strict';

	angular.module('transpondersNoTx')
		.controller('transpondersNoTxController', TranspondersNoTxController);

	function TranspondersNoTxController(longPolling, $scope, $resource) {
		var vm = this;

		var i18n = {
			"description": "Non-transmitting transponders"
		};

		vm.i18n = function(key) {
			return i18n[key];
		};

		$scope.$on('$destroy', function() {
			stopLongPolling();
		});

		updateTransponderCount();
		startLongPolling();

		function updateTransponderCount() {
			return $resource("/rules/rest/tickets/countAssetsNotSending").get(function(response) {
				vm.transponderCount = response.data;
				return vm.transponderCount;
			});
		}

		function startLongPolling() {
	        vm.longPollingId = longPolling.poll("/rules/activity/ticket", function(response) {
	            if (response.ids.length > 0) {
	            	updateTransponderCount();
	            }
	        });
		}

		function stopLongPolling() {
			longPolling.cancel(vm.longPollingId);
		}
	}
})();