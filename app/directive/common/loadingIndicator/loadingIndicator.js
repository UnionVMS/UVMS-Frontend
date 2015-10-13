angular.module('unionvmsWeb').directive('loadingIndicator', function($compile) {
    return {
        scope: {
            loadingIndicator: "=",
            message: "="
        },
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem["0"].style.position = 'relative';
            elem.append($compile('<div ng-show="loadingIndicator" class="loadingIndicator"><div class="spinnerOverlay"></div><div class="spinner"><div class="circle"></div><div class="circle"></div></div><div class="loadingText" ng-show="message"><span ng-bind="message"></span></div></div>')(scope));
        }
    };
});
