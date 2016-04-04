angular.module('unionvmsWeb').directive('loadingPanel', function(loadingStatus) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			type: '@',
			ngModel : '='
		},
		templateUrl: 'directive/common/loadingPanel/loadingPanel.html',
		link: function(scope, element, attrs, fn) {
			scope.loadingStatus = loadingStatus;
			
			scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
			    if (angular.isDefined(newVal) && newVal !== oldVal && _.isBoolean(newVal)){
			        scope.loadingStatus.isLoading(scope.type, newVal);
			    }
			});
		}
	};
});
