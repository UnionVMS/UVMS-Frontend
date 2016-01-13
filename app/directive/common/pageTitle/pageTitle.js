(function() {
	angular.module('unionvmsWeb').directive('pageTitle', ['$rootScope', 'locale', function($rootScope, locale) {
		return {
			link: function(scope, elem) {
				$rootScope.$on('$stateChangeSuccess', function(event, toState) {
					var title = locale.getString('header.pageTitle.default');
					if (toState.data && toState.data.pageTitle) {
						title = locale.getString('header.pageTitle.' + toState.data.pageTitle) + " - " + title;
					}

					elem.text(title);
				});				
			}
		};
	}]);
})();