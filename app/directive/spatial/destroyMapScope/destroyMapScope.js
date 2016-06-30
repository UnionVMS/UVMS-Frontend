angular.module('unionvmsWeb').directive('destroyMapScope', function() {
    return function(scope, elem, attrs){
        scope.$on('$destroy', function(){
            if (scope.$parent.map){
                delete scope.$parent.map;
            }
        })
    };
});
