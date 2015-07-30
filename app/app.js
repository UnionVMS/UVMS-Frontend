angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize', 'tmh.dynamicLocale', 'leaflet-directive']);

//Resolve used for all routes
var generalRouteResolves =  {
    languages: function(initService){
        return initService.loadLanguageFiles();
    },
    config: function(initService){
        return initService.loadConfig();
    }    
};

angular.module('unionvmsWeb').config(function($routeProvider, tmhDynamicLocaleProvider) {

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

    $routeProvider
        .when('/today',{
            templateUrl:'partial/today/today.html',
            resolve: generalRouteResolves
        })
        .when('/assets',{
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
        .when('/communication/polling/logs', {
            templateUrl: 'partial/polling/pollingLogs/pollingLogs.html', 
            resolve: generalRouteResolves
        })
        .when('/communication/:id', {
            templateUrl: 'partial/mobileTerminal/mobileTerminal.html', 
            resolve: generalRouteResolves
        })        
        .when('/movement', {
            templateUrl: 'partial/movement/movement.html', 
            resolve: generalRouteResolves
        })
        .when('/audit', {
            templateUrl: 'partial/audit/auditLog/auditLog.html', 
            resolve: generalRouteResolves
        })
        .when('/audit/auditlog', {
            templateUrl: 'partial/audit/auditLog/auditLog.html', 
            resolve: generalRouteResolves
        })
        .when('/audit/auditconfiguration', {
            templateUrl: 'partial/audit/auditConfiguration/auditConfiguration.html', 
            resolve: generalRouteResolves
        })
        .when('/movement/manual', {
            templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html',
            resolve: generalRouteResolves
        })
        .when('/reporting', {
            templateUrl: "partial/spatial/spatial.html",
            //resolve: generalRouteResolves
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
    defaultLocale: 'en-US',
    sharedDictionary: 'common',
    fileExtension: '.lang.json?ts=' +(new Date()).getTime(),
    persistSelection: true,
    cookieName: 'COOKIE_LOCALE_LANG',
    observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
    delimiter: '::'
});


//Service used for bootstrapping the application
angular.module('unionvmsWeb').factory('initService',function(configurationService, locale, tmhDynamicLocale, $window) {

    tmhDynamicLocale.set($window.navigator.userLanguage || $window.navigator.language);

    var initService = {
        //Load the configurations
        loadConfig : function(){
            return configurationService.setup();
        },        
        //Load the listed i18n files
        loadLanguageFiles : function(){
            return locale.ready([
                'common',
                'header',
                'mobileTerminal',
                'polling',
                'vessel',
                'movement',
                'config',
                'spatial'
            ]);
        },
    };

    return initService;
});