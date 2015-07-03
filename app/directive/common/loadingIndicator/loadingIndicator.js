angular.module('unionvmsWeb').directive('loadingIndicator', function($compile) {
    return {
        scope: {
            loadingIndicator: "="
        },
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem["0"].style.position = 'relative';
            elem.append($compile('<div ng-show="loadingIndicator" class="loadingIndicator"><i class="fa fa-spinner fa-spin fa-pulse fa-2x spinner"></i></div>')(scope));
        }
    };
});
