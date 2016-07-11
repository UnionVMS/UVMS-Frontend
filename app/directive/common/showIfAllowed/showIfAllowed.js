/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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