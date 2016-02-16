(function() {

	angular.module('unionvmsWeb')
		.directive('incomingMovements', IncomingMovementsDirective);

    function IncomingMovementsDirective() {
        return {
            controller: 'incomingMovementsController',
            controllerAs: 'ctrl',
            restrict: 'E',
	     	scope: true,
            templateUrl: 'widgets/incomingMovements/incomingMovements.html', // temporary location
        };
    }

})();
