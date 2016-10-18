angular.module('unionvmsWeb').directive('fishingTripPanel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '='
		},
		templateUrl: 'directive/activity/fishingTripPanel/fishingTripPanel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
