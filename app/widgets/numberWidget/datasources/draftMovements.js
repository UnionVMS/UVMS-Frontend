/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
			$resource('movement/rest/tempmovement/list').save(getQuery(page), function(response) {
				var drafts = countDrafts(response.movement);
				if (response.currentPage < response.totalNumberOfPages) {
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
