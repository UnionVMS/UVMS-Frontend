(function() {
	'use strict';

	angular.module('transpondersNoTx')
		.directive('transpondersNoTx', TranspondersNoTxDirective);

	function TranspondersNoTxDirective() {
		return {
			controller: 'transpondersNoTxController',
			controllerAs: 'ctrl',
			restrict: 'E',
			scope: true,
			templateUrl: 'widgets/transpondersNoTx/transpondersNoTx.html'
		};
	}
})();