angular.module('unionvmsWeb').directive('vesselPanel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '='
		},
		templateUrl: 'directive/activity/vesselPanel/vesselPanel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});