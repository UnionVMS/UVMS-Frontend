angular.module('unionvmsWeb').directive('prevNextPagePagination', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            page : '=',
            total : '=',
            prev: "=",
            next: "="
		},
		templateUrl: 'directive/common/prevNextPagePagination/prevNextPagePagination.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
