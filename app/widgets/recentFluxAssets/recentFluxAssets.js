(function() {

	var app = angular.module('activeFluxAssets', ['ngResource']);
	app.directive('activeFluxAssets', ActiveFluxAssetsDirective);
	app.controller('activeFluxAssetsController', ActiveFluxAssetsController);
	app.provider('activeFluxAssetsService', ActiveFluxAssetsServiceProvider);

	ActiveFluxAssetsController.$inject = ['activeFluxAssetsService'];

	function ActiveFluxAssetsDirective(){
		return {
			controller: 'activeFluxAssetsController as ctrl',
			restrict: 'E',
			templateUrl: 'widgets/recentFluxAssets/recentFluxAssets.html', // temporary location
		};
	}

	function ActiveFluxAssetsController(activeFluxAssetsService) {
		this.items = activeFluxAssetsService.getAssets();

		var i18n = {
			nations: {
				at: "Austria",
				be: "Belgium",
				bg: "Bulgaria",
				cy: "Cyprus",
				cz: "Czech Republic",
				de: "Germany",
				dk: "Denmark",
				ee: "Estonia",
				es: "Spain",
				fi: "Finland",
				fr: "France",
				gb: "Great Britain",
				gr: "Greece",
				hr: "Croatia",
				hu: "Hungary",
				ie: "Ireland",
				im: "Isle of Man",
				it: "Italy",
				lt: "Lithuania",
				lu: "Luxembourg",
				lv: "Latvia",
				mt: "Malta",
				nl: "Netherlands",
				pl: "Poland",
				pt: "Portugal",
				ro: "Romania",
				si: "Slovenia",
				sk: "Slovakia",
				sv: "Sweden"
			},
			"header": "Active FLUX assets",
			"subheader": "With positions received in the last 24h."
		};

		this.i18n = function(key) {
			return i18n[key];
		};

		this.nationName = function(nation) {
			return i18n.nations[nation] || nation;
		};
	}

	function ActiveFluxAssetsServiceProvider() {
		var remoteBaseUrl;
		var useDummyData = false;
		this.setRemoteBaseUrl = function(url) {
			remoteBaseUrl = url;
		};
		this.setUseDummyData = function(bool) {
			useDummyData = bool;
		};
		this.$get = ['$resource', 'recentFluxAssetsDummyData', function($resource, dummyData) {
			return new ActiveFluxAssetsService($resource, remoteBaseUrl, useDummyData ? dummyData : undefined);
		}];
	}

	function ActiveFluxAssetsService($resource, remoteBaseUrl, dummyData) {
		return {
			getAssets: getAssets
		};

		function getAssets() {
			if (dummyData) {
				return dummyData;
			}

			return $resource(remoteBaseUrl + "/assets").query();
		}
	}

})();
