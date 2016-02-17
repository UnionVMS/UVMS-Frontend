(function() {

	var app = angular.module('widget.assetsInZone', ['ngResource']);
	app.directive('assetsInZone', AssetsInZoneDirective);
	app.controller('assetsInZoneController', AssetsInZoneController);
	app.factory('assetsInZoneService', AssetsInZoneService);

	function AssetsInZoneDirective(){
		return {
			controller: 'assetsInZoneController',
			controllerAs: 'ctrl',
			restrict: 'E',
			scope: {
				flagState: '=',
				refreshInterval: '='
			},
			templateUrl: 'widgets/assetsInZone/assetsInZone.html'
		};
	}

	function AssetsInZoneController(assetsInZoneService, $scope, $interval) {
		var vm = this;
		function updateList() {
			assetsInZoneService.getAssets($scope.flagState).then(function(assets) {
				vm.items = assets;
				vm.error = undefined;
			}, function(error) {
				vm.items = undefined;
				vm.error = "An error occurred";
			});
		}

		updateList();

		var refreshInterval = $scope.refreshInterval || 10;
		vm.refreshTimer = $interval(updateList, refreshInterval * 1000);

		$scope.$on('$destroy', function() {
			$interval.cancel(vm.refreshTimer);
			vm.refreshTimer = undefined;
		});

		var i18n = {
			nations: {
				"AUT": "Austria",
				"BEL": "Belgium",
				"BGR": "Bulgaria",
				"CYP": "Cyprus",
				"CZE": "Czech Republic",
				"DEU": "Germany",
				"DNK": "Denmark",
				"ESP": "Spain",
				"EST": "Estonia",
				"FIN": "Finland",
				"FRA": "France",
				"GBR": "United Kingdom",
				"GRC": "Greece",
				"HRV": "Croatia",
				"HUN": "Hungary",
				"IMN": "Isle of Man",
				"IRL": "Ireland",
				"ITA": "Italy",
				"LTU": "Lithuania",
				"LUX": "Luxembourg",
				"LVA": "Latvia",
				"MLT": "Malta",
				"NLD": "Netherlands",
				"POL": "Poland",
				"PRT": "Portugal",
				"ROU": "Romania",
				"SVK": "Slovakia",
				"SVN": "Slovenia",
				"SWE": "Sweden"
			},
			"header": "Assets in your zone",
			"noAssets": "No assets in zone in last 24 hours."
		};

		this.i18n = function(key) {
			return i18n[key];
		};

		this.nationName = function(nation) {
			return i18n.nations[nation] || nation;
		};
	}

	function formatDate(moment) {
		return moment.format('YYYY-MM-DD HH:mm:ss Z');
	}

	function getQuery(flagState) {
		var toDate = moment.utc();
		var fromDate = toDate.clone().subtract('hours', 24);

		var query = {
			areaCode: flagState,
			fromDate: formatDate(fromDate),
			toDate: formatDate(toDate)
		};

		return query;
	}

	function getUniqueConnectIds(movements) {
		var uniqueConnectIds = [];
		for (var i = 0; i < movements.length; i++) {
			var connectId = movements[i].connectId;
			if (uniqueConnectIds.indexOf(connectId) < 0) {
				uniqueConnectIds.push(connectId);
			}
		}

		return uniqueConnectIds;
	}

	function AssetsInZoneService($resource, $q) {
		return {
			getAssets: getAssets
		};

		function getAssets(flagState) {
			var deferred = $q.defer();
			$resource('/movement/rest/movement/listByAreaAndTimeInterval').save(getQuery(flagState), function(response) {
				if (response.code !== "200") {
					// Could not get movements.
					deferred.reject(response.data || "Invalid data.");
				}
				else if (!angular.isArray(response.data.movement) || response.data.movement.length === 0) {
					// No movements exist for this time interval and area code.
					deferred.resolve([]);
				}
				else {
					var connectIds = getUniqueConnectIds(response.data.movement);
					return $resource('/asset/rest/asset/listGroupByFlagState').save(connectIds, function(response) {
						if (response.code !== 200) {
							// Could not get assets.
							deferred.reject(response.data || "Invalid data.");
						}
						else {
							// Resolve unique assets by flag state.
							deferred.resolve(response.data.numberOfAssetsGroupByFlagState);
						}
					}, function(error) {
						// Asset request failed.
						deferred.reject(error);
					});
				}
			}, function(error) {
				// Movement request failed.
				deferred.reject(error);
			});

			return deferred.promise;
		}
	}

})();
