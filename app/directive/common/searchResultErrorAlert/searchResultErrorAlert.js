angular.module('unionvmsWeb').directive('searchResultErrorAlert', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
            type : '@'
		},
		templateUrl: 'directive/common/searchResultErrorAlert/searchResultErrorAlert.html',
		link: function(scope, element, attrs, fn) {
            if(scope.type === 'info'){
                scope.alertClass = 'info';
            }
            else{
                scope.alertClass = 'danger';
            }
		}
	};
});
