angular.module('unionvmsWeb').filter('capitalize', function() {
	return function(text) {
		if (text!=null) {
			text = text.toLowerCase();
		    return text.substring(0,1).toUpperCase() + text.substring(1);
		}
	};
});