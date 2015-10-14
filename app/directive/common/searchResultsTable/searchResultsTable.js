angular.module('unionvmsWeb').directive('searchResultsTable', function() {
	return {
		restrict: 'A',
		transclude: true,
		scope: {
            search : '=',
		},
		templateUrl: 'directive/common/searchResultsTable/searchResultsTable.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
