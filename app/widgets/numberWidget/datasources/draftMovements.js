(function() {
	'use strict';

	angular
		.module('numberWidget')
		.directive('draftMovements', DraftMovements);

	/* @ngInject */
	function DraftMovements($resource, $q) {
		return {
			require: 'numberWidget',
			link: function(scope, element, attrs, numberWidgetCtrl) {
				numberWidgetCtrl.setTitle('Manual reports outbox');
				function reload() {
					countDraftMovements().then(function(drafts) {
						numberWidgetCtrl.setValue(drafts);
					});
				}

				scope.$on("dashboard.refresh", reload);
				reload();
			}
		};

		function countDraftMovements() {
			var deferred = $q.defer();
			recursiveFn(1).then(function(drafts) {
				deferred.resolve(drafts);
			});

			return deferred.promise;
		}

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
			if (!movements) {
				return 0;
			}

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
	}
})();