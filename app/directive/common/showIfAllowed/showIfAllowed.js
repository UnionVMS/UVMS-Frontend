angular.module('unionvmsWeb').directive('showIfAllowed', function($log, userService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, fn) {
            var checkAccess = function(feature, module) {
                //Only check in current context
                return userService.isAllowed(feature, module, true);
            };

            //Split showIfAllowed attribute into array
            var features = attrs.showIfAllowed.split(',');

            //Remove element if feature(s) not allowed
            $.each(features, function(index, feature){
                //Default module
                var module = 'Union-VMS';
                
                //Split on : if exists
                if(feature.indexOf(':') >= 0){
                    module = feature.split(':')[0];
                    feature = feature.split(':')[1];
                }

                $log.debug("showIfAllowedDirective :: Check if user has access to feature: " +feature +" in module " +module);
                if(!checkAccess(feature, module)){
                    $log.debug("showIfAllowedDirective :: User has no access to feature: " +feature +" in module " +module);
                    element.remove();
                    return false;
                }
            });
		}
	};
});