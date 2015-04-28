angular.module('unionvmsWeb').directive('newPollWizardProgress', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			step :'@'
		},
		templateUrl: 'directive/polling/newPollWizardProgress/newPollWizardProgress.html',
		link: function(scope, element, attrs, fn) {

			scope.isActiveStep = function(step){
                return parseInt(scope.step) === step;
            };
            scope.isFinishedStep = function(step){
                return parseInt(scope.step) > step;
            };            
		}
	};
});
