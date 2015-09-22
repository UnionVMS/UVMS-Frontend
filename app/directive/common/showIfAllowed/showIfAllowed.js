angular.module('unionvmsWeb').directive('showIfAllowed', function($log, userService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, fn) {
            var checkAccess = function(feature, module) {
                if(angular.isUndefined(module)){
                    module = 'Union-VMS';
                }

                return userService.isAllowed(feature, module, true);
            };

            //Split showIfAllowed attribute into array
            var features = attrs.showIfAllowed.split(',');

            //Remove element if feature(s) not allowed
            $.each(features, function(index, feature){
                $log.debug("showIfAllowedDirective :: Check if user has access to feature: " +feature);
                if(!checkAccess(feature)){
                    $log.debug("showIfAllowedDirective :: User has no access to feature: " +feature);
                    element.remove();
                    return false;
                }
            });            
		}
	};
});