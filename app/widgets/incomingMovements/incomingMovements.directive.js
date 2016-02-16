(function() {

	angular.module('unionvmsWeb')
		.directive('incomingMovements', IncomingMovementsDirective);

    function IncomingMovementsDirective() {
        return {
            controller: 'incomingMovementsController',
            controllerAs: 'ctrl',
            restrict: 'E',
	     	scope: {
	     		refreshInterval: '='
	     	},
            templateUrl: 'widgets/incomingMovements/incomingMovements.html', // temporary location
        };
    }

})();
