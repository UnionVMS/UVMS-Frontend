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

	angular.module('transpondersNoTx').directive('numberWidget', NumberWidget);

	function NumberWidget() {
		return {
			scope: {
				title: '@',
				value: '='
			},
			template: '<div class="transponders-no-tx"><div class="description">{{title}}</div><div class="value">{{value}}</div></div>'
		};
	}
})();