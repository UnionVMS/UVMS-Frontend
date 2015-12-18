angular.module('unionvmsWeb').directive('loadingIndicator', function($compile) {
    return {
        scope: {
            loadingIndicator: "=",
            message: "=",
            size: "@",
            type: "@"
        },
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem["0"].style.position = 'relative';
            var spinnerHTML;
            //SPINNER
            if(scope.type === "SPINNER"){
                spinnerHTML = '<i class="fa fa-spinner fa-spin fa-pulse"></i>';
            }
            //CIRCLE BOUNCE
            else if(scope.type === "BOUNCE"){
                spinnerHTML = '<div class="circle"></div><div class="circle"></div>';
            }
            //SHIP
            else{
                spinnerHTML = '<div class="spinningShipContainer"><div></div></div>';
            }

            elem.append($compile('<div ng-show="loadingIndicator" class="loadingIndicator" ng-class="size"><div class="spinnerOverlay"></div><div class="spinner">' +spinnerHTML +'</div><div class="loadingText" ng-show="message"><span ng-bind="message"></span></div></div>')(scope));
        }
    };
});
