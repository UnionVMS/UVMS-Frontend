angular.module('unionvmsWeb').directive('showIfAllowed', function($log, userService) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, fn) {
            var checkAccess = function(feature, application) {
                //Only check in current context
                return userService.isAllowed(feature, application, true);
            };

            //Is it enought to have access to one of the features or must the user have access to all features
            var accessToOneFeatureIsEnough = false;
            if(angular.isDefined(attrs.showIfAllowedAny)){
                accessToOneFeatureIsEnough = true;
            }

            //Split showIfAllowed attribute into array
            var features = attrs.showIfAllowed.split(',');
            if(accessToOneFeatureIsEnough){
                $log.debug("showIfAllowedDirective :: Check if user has access to any of these features:" +features);
            }else{
                $log.debug("showIfAllowedDirective :: Check if user has access to all of these features:" +features);
            }

            //Remove element if feature(s) not allowed
            var access = false;
            $.each(features, function(index, feature){
                //Default application
                var application = 'Union-VMS';

                //Split on : if exists
                if(feature.indexOf(':') >= 0){
                    application = feature.split(':')[0];
                    feature = feature.split(':')[1];
                }

                $log.debug("showIfAllowedDirective :: Check if user has access to feature: " +feature +" in application " +application);
                if(checkAccess(feature, application)){
                    access = true;
                    if(accessToOneFeatureIsEnough){
                        return false;
                    }
                }else{
                    $log.debug("showIfAllowedDirective :: User has no access to feature: " +feature +" in application " +application);                
                    if(!accessToOneFeatureIsEnough){
                        access = false;
                        return false;
                    }else{
                        access = access || false;
                    }
                }
            });

            if(!access){
                element.remove();
            }
		}
	};
});