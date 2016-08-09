angular.module('unionvmsWeb').directive('loadingPanel', function(loadingStatus) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			type: '@'
		},
		templateUrl: 'directive/common/loadingPanel/loadingPanel.html',
		link: function(scope, element, attrs, fn) {
			scope.loadingStatus = loadingStatus;
		}
	};
});
