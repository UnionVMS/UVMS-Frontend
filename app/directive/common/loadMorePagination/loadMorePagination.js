angular.module('unionvmsWeb').directive('loadMorePagination', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            page : '=',
            total : '=',
            loadmore: "="
		},
		templateUrl: 'directive/common/loadMorePagination/loadMorePagination.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});