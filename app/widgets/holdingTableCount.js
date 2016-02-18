(function() {
	angular.module('unionvmsWeb')
		.factory('holdingTable', HoldingTable);

	/* @ngInject */
	function HoldingTable($resource, $q) {
		return {
			countAlarms: countAlarms,
			countOpen: countOpen,
			countDraftMovements: countDraftMovements
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

		function countAlarms() {
			var query = {
				ticketSearchCriteria: [
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
			
			$resource('/rules/rest/tickets/list/vms_admin_com').save(query, function(response) {
				deferred.resolve(response.data.totalNumberOfPages);
			});

			return deferred.promise;

		}

		function countDraftMovements(startPage) {
			
			function getQuery(page) {
				return {
					movementSearchCriteria: [],
					pagination: {
						page: page,
						listSize: 100
					}
				};
			}

			function countDrafts(movements) {
				var drafts = 0;
				for (var i = 0; i < movements.length; i++) {
					if (!movements[i].archived) {
						drafts += 1;
					}
				}

				return drafts;
			}

			function recursiveFn(page) {
				var deferred = $q.defer();
				$resource('/movement/rest/tempmovement/list').save(getQuery(page), function(response) {
					var drafts = countDrafts(response.data.movement);
					if (response.data.currentPage < response.data.totalNumberOfPages) {
						recursiveFn(page+1).then(function(moreDrafts) {
							deferred.resolve(drafts + moreDrafts);
						});
					}
					else {
						deferred.resolve(drafts);
					}
				});

				return deferred.promise;
			}

			var deferred = $q.defer();
			recursiveFn(1).then(function(drafts) {
				deferred.resolve(drafts);
			});

			return deferred.promise;
		}
	}
})();