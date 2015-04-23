angular.module('unionvmsWeb').directive("sortableTableHeader", function() {
    return {
        restrict: 'A',
        transclude: true,
        template : 
        '<a class="pointer" ng-click="onClick()">'+
        '<span ng-transclude></span>&nbsp;'+ 
        '<i class="fa" ng-class="{\'fa-caret-down\' : order === by && !reverse,  \'fa-caret-up\' : order===by && reverse, \'fa-sort\' : order !== by}"></i>'+
        '</a>',
        scope: {
            order: '=',
            by: '=',
            reverse : '='
        },
        link: function(scope, element, attrs) {
            scope.onClick = function () {
                if( scope.order === scope.by ) {
                    scope.reverse = !scope.reverse;
                } else {
                    scope.by = scope.order ;
                    scope.reverse = false; 
                }
            };
        }
    };
});