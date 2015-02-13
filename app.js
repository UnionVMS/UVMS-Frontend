angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate']);

angular.module('unionvmsWeb').config(function($routeProvider) {
    $routeProvider
        .when('/today',{templateUrl:'partial/today/today.html'})
        .when('/vessel', {templateUrl: 'partial/vessel/vessel.html'});

    /* Add New Routes Above */
    $routeProvider.otherwise({redirectTo:'/today'});


});

angular.module('unionvmsWeb').run(function($rootScope) {

    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };



});
