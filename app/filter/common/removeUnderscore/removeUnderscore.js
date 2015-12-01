angular.module('unionvmsWeb').filter('removeUnderscore', function() {
	return function(text) {
		if(angular.isDefined(text))
		{
			text = text.replace(/_/g, " ");
		}
		return text;
	};
});