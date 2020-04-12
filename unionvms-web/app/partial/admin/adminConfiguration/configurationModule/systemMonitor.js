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
angular.module('unionvmsWeb').controller('SystemMonitorController', function($scope, $resource, locale) {

	$scope.searchResults = {
		loading: true,
		zeroResultsErrorMessage: locale.getString('config.no_pings_message')
	};

	$resource("config/rest/pings").get(function(response) {
		$scope.searchResults.loading = false;
		$scope.searchResults.items = response.data;
		$scope.searchResults.showZeroResultsMessage = Object.keys(response.data).length === 0;
	});

	$scope.statusLabel = function(status) {
		return status.online ? 'config.online' : 'config.offline';
	};

});