angular.module('unionvmsWeb').directive('searchResultErrorAlert', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {            
		},
		templateUrl: 'directive/common/searchResultErrorAlert/searchResultErrorAlert.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
