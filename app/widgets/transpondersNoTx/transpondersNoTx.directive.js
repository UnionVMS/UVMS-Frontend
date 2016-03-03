(function() {
	'use strict';

	angular
		.module('transpondersNoTx')
		.directive('numberWidget', NumberWidget);

	function NumberWidget() {
		return {
			controller: function($scope) {
				var vm = this;
				this.setTitle = function(newTitle) {
					vm.title = newTitle;
				};
				this.setValue = function(newValue) {
					vm.value = newValue;
				};
			},
			scope: true,
			controllerAs: 'ctrl',
			templateUrl: 'widgets/transpondersNoTx/transpondersNoTx.html'
		};
	}
})();