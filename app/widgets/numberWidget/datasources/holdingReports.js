(function() {
	'use strict';

	angular
		.module('numberWidget')
		.directive('holdingReports', HoldingReports);

	/* @ngInject */
	function HoldingReports($resource, $q) {
		return {
			require: 'numberWidget',
			link: function(scope, element, attrs, numberWidgetCtrl) {
				numberWidgetCtrl.setTitle('Reports in holding table');
				function reload() {
					countOpen().then(function(count) {
						numberWidgetCtrl.setValue(count);
					});
				}

				scope.$on("dashboard.refresh", reload);
				reload();
			}
		};

		function countOpen() {
			var query = {
				alarmSearchCriteria: [
				{
					key: 'STATUS', 
					value: 'OPEN'
				}
				],
				pagination: {
					page: 1,
					listSize: 1
				}
			};

			var deferred = $q.defer();
			$resource('/rules/rest/alarms/list').save(query, function(response) {
				deferred.resolve(response.data.totalNumberOfPages);
			});

			return deferred.promise;
		}
	}
})();