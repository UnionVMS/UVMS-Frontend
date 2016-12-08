/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').directive('resize', function($window, $document) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, fn) {
		    var w = angular.element($window);
		    scope.$watch(function(){
		        return {
		            'h': w.height(),
		            'w': w.width()
		        };
		    }, function(newValue, oldValue){
		        scope.windowHeight = newValue.h;
		        scope.windowWidth = newValue.w;
		        
		        scope.doResize = function(offset, minHeight){
		            scope.$eval(attrs.notifier);
		            var footerHeight = $document[0].getElementsByTagName('footer')[0].offsetHeight;
		            var headerHeight = $document[0].getElementsByTagName('header')[0].offsetHeight;
		            var newHeight = newValue.h - headerHeight - footerHeight - offset;
		            
		            if (newHeight < minHeight) {
		                newHeight = minHeight;
		            }
		            
		            return {
		                'height': newHeight + 'px'
		            };
		        };
		    }, true);
		    
		    w.bind('resize', function(){
		        scope.$apply();
		    });
		}
	};
});
