angular.module('unionvmsWeb').directive('loadingIcon', function() {
	return {
        replace : true,
		restrict: 'E',
        template :
        '<div class="loadingIconContainer"><i class="fa fa-spinner fa-spin fa-pulse fa-2x"></i></div>',
		link: function(scope, element, attrs, fn) {
		}
	};
});