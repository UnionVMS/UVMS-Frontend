angular.module('unionvmsWeb').directive('advancedSearch', function() {
    return {
		restrict: 'E',
		replace: true,
		templateUrl: 'directive/advancedSearch/advancedSearch.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});
