angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize']);

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

//Configure for i18n
angular.module('unionvmsWeb').value('localeConf', {
    basePath: 'i18n',
    defaultLocale: 'en-US',
    sharedDictionary: 'common',
    fileExtension: '.lang.json?ts=' +(new Date()).getTime(),
    persistSelection: true,
    cookieName: 'COOKIE_LOCALE_LANG',
    observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
    delimiter: '::'
});

