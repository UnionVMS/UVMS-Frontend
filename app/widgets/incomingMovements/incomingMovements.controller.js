/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
(function() {

	angular.module('unionvmsWeb')
		.controller('incomingMovementsController', IncomingMovementsController);

	function IncomingMovementsController($scope, searchService, locale, $interval) {
		var vm = this;

		reloadList();

		var refreshInterval = $scope.refreshInterval || 10;
		vm.refreshTimer = $interval(reloadList, refreshInterval * 1000);

		$scope.$on('$destroy', function() {
			$interval.cancel(vm.refreshTimer);
			vm.refreshTimer = undefined;
			searchService.reset();
		});

		function reloadList() {
			searchService.reset();
			searchService.getListRequest().listSize = 10;
			searchService.searchMovements().then(function(page) {
				$scope.currentSearchResults = page;
			});
		}
	}

})();