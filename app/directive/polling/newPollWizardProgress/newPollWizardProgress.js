angular.module('unionvmsWeb').directive('newPollWizardProgress', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			step :'@'
		},
		templateUrl: 'directive/polling/newPollWizardProgress/newPollWizardProgress.html',
		link: function(scope, element, attrs, fn) {

			scope.isFirstStep = function(){return scope.step === "1";};
			scope.isSecondStep = function(){return scope.step === "2";};
			scope.isLastStep = function(){return scope.step === "3";};			
		}
	};
});
