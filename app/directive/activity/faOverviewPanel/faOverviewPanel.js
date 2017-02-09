angular.module('unionvmsWeb').directive('faOverviewPanel', function($filter) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			ngModel: '='
		},
		templateUrl: 'directive/activity/faOverviewPanel/faOverviewPanel.html',
		link: function(scope, element, attrs, fn) {
			scope.isArray = function(val){
				 return _.isArray(val);
			};
		}
	};
});
