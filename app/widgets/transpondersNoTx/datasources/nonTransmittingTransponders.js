(function() {
	'use strict';

	angular
		.module('transpondersNoTx')
		.directive('nonTransmittingTransponders', NonTransmittingTransponders);

	/* @ngInject */
	function NonTransmittingTransponders($resource, $q) {
		return {
			require: 'numberWidget',
			link: function(scope, element, attrs, numberWidgetCtrl) {
				numberWidgetCtrl.setTitle('Non-transmitting transponders');
				function reload() {
					getNonTransmittingCount().then(function(count) {
						numberWidgetCtrl.setValue(count);
					});
				}

				scope.$on("dashboard.refresh", reload);
				reload();
			}
		};

		function getNonTransmittingCount() {
			var deferred = $q.defer();
			$resource("/rules/rest/tickets/countAssetsNotSending").get(function(response) {
				deferred.resolve(response.data);
			});

			return deferred.promise;
		}
	}
})();