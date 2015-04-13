angular.module('unionvmsWeb').directive('responseMessage', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            message : '@',
            alertlevel: '@'
		},
		templateUrl: 'directive/common/responseMessage/responseMessage.html',
		link: function(scope, element, attrs, fn) {

        }
	};
});
