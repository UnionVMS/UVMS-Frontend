(function() {
	'use strict';

	angular
		.module('transpondersNoTx')
		.directive('openTickets', OpenTickets);

	/* @ngInject */
	function OpenTickets($resource, $q) {
		return {
			require: 'numberWidget',
			link: function(scope, element, attrs, numberWidgetCtrl) {
				numberWidgetCtrl.setTitle('Transponder alarms');
				function reload() {
					countAlarms().then(function(count) {
						numberWidgetCtrl.setValue(count);
					});
				}

				scope.$on("dashboard.refresh", reload);
				reload();
			}
		};

		function countAlarms() {
			var query = {
				ticketSearchCriteria: [{
					key: 'STATUS', 
					value: 'OPEN'
				}],
				pagination: {
					page: 1,
					listSize: 1
				}
			};

			var deferred = $q.defer();
			$resource('/rules/rest/tickets/list/vms_admin_com').save(query, function(response) {
				deferred.resolve(response.data.totalNumberOfPages);
			});

			return deferred.promise;
		}
	}
})();

