angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize', 'tmh.dynamicLocale','angucomplete', 'leaflet-directive']);

//Resolve used for all routes
var generalRouteResolves =  {
    languages: function(initService){
        return initService.loadLanguageFiles();
    }
};

angular.module('unionvmsWeb').config(function($routeProvider, tmhDynamicLocaleProvider) {

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

    $routeProvider
        .when('/today',{
            templateUrl:'partial/today/today.html',
            resolve: generalRouteResolves
        })
        .when('/vessel',{
            templateUrl:'partial/vessel/vessel.html',
            resolve: generalRouteResolves
        })
        .when('/communication', {
            templateUrl: 'partial/mobileTerminal/mobileTerminal.html', 
            resolve: generalRouteResolves
        })
        .when('/communication/polling', {
            templateUrl: 'partial/polling/polling.html', 
            resolve: generalRouteResolves
        })
        .when('/movement', {
            templateUrl: 'partial/movement/movement.html', 
            resolve: generalRouteResolves
        })
        .when('/communication/polling/logs', {
            templateUrl: 'partial/polling/pollingLogs/pollingLogs.html', 
            resolve: generalRouteResolves
        })
        .when('/movement/manual', {
            templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html'
        });
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
    defaultLocale: 'en-us',
    sharedDictionary: 'common',
    fileExtension: '.lang.json?ts=' +(new Date()).getTime(),
    persistSelection: true,
    cookieName: 'COOKIE_LOCALE_LANG',
    observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
    delimiter: '::'
});


//Service used for bootstrapping the application
angular.module('unionvmsWeb').factory('initService',function(locale, tmhDynamicLocale, $window) {

    tmhDynamicLocale.set($window.navigator.userLanguage || $window.navigator.language);

    var initService = {
        //Load the listed i18n files
        loadLanguageFiles : function(){
            return locale.ready([
                'common',
                'header',
                'mobileTerminal',
                'polling',
                'vessel',
                'movement'
            ]);
        },
    };

    return initService;
});