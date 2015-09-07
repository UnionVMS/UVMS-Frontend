angular.module('unionvmsWeb').directive('searchResultsTable', function() {
	return {
		restrict: 'A',
		transclude: true,
		scope: {
            search : '=',
            loadNextPageFunction : '='
		},
		templateUrl: 'directive/common/searchResultsTable/searchResultsTable.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
