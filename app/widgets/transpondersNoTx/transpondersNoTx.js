(function() {

	var app = angular.module('transpondersNoTx', ['ngResource']);
	app.directive('transpondersNoTx', TranspondersNoTxDirective);
	app.controller('transpondersNoTxController', TranspondersNoTxController);
	app.service('transpondersNoTxService', TranspondersNoTxService);

	TranspondersNoTxController.$inject = ['transpondersNoTxService'];

	function TranspondersNoTxDirective(){
		return {
			controller: 'transpondersNoTxController as noTxCtrl',
			restrict: 'E',
			templateUrl: 'widgets/transpondersNoTx/transpondersNoTx.html'
		};
	}

	function TranspondersNoTxController(transpondersNoTxService) {
		var service = this;
		transpondersNoTxService.getTranspondersNoTx().then(function(count) {
			service.transponderCount = count;
		});
		var i18n = {
			"description": "Non-transmitting transponders"
		};
		this.i18n = function(key) {
			return i18n[key];
		};
	}

	TranspondersNoTxService.$inject = ['$resource', '$q'];

	function TranspondersNoTxService($resource, $q) {
		return {
			getTranspondersNoTx: getTranspondersNoTx
		};

		function getTranspondersNoTx() {
			var deferred = $q.defer();
			deferred.resolve(999);
			return deferred.promise;
		}
	}

})();
