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