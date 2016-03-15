(function() {

	angular
        .module('unionvmsWeb')
		.directive('exchangeHistory', ExchangeHistoryDirective);

    function ExchangeHistoryDirective() {
        return {
            controller: 'exchangeHistoryController',
            controllerAs: 'ctrl',
            restrict: 'E',
	     	scope: {
	     		refreshInterval: '='
	     	},
            templateUrl: 'widgets/exchangeHistory/exchangeHistory.html'
        };
    }

})();
