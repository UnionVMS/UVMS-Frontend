angular.module('unionvmsWeb').factory('mapReference', function(){
    var ref = {};
    
    return ref;
})
.directive('destroyMapScope', function(mapReference) {
    return {
        restrict: 'A',
        scope: {
            destroyMapScope: '@'
        },
        link:  function(scope, elem, attrs){
            scope.$on('$destroy', function(){
                delete mapReference[scope.destroyMapScope].map;
            });
        }
    }
});
