angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize', 'tmh.dynamicLocale', 'leaflet-directive', 'datatables', 'datatables.bootstrap', 'datatables.columnfilter', 'ngCsv', 'ui.router']);

var getCurrentUserPromise = function() {
    var currentUserPromise = function(userService) {
        return userService.findCurrentUser();
    };

    currentUserPromise.$inject = ['userService'];
    return currentUserPromise;
};

//Resolve used for all routes
var generalRouteResolves =  {
    languages: function(initService){
        return initService.loadLanguageFiles();
    },
    config: function(initService){
        return initService.loadConfig();
    },
    //currentUser: getCurrentUserPromise() // TODO: Uncomment to enforce user login
};

angular.module('unionvmsWeb').config(function($stateProvider, tmhDynamicLocaleProvider, $injector) {

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

  

    $stateProvider
        .state('today', {
            url: '/today',
            views: { module: { templateUrl: 'partial/today/today.html' } },
            resolve: generalRouteResolves
        })
        .state('movement', {
            url: '/movement',
            views: { module: { templateUrl: 'partial/movement/movement.html' } },
            resolve: generalRouteResolves
        })
        .state('movement-manual', {
            url: '/movement/manual',
            views: { module: { templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html' } },
            resolve: generalRouteResolves
        })
        .state('movement-id', {
            url: '/movement/:id',
            views: { module: { templateUrl: 'partial/movement/movement.html' } },
            resolve: generalRouteResolves
        })
        .state('assets', {
            url: '/assets',
            views: { module: { templateUrl: 'partial/vessel/vessel.html' } },
            resolve: generalRouteResolves
        })
        .state('assets-id', {
            url: '/assets/:id',
            views: { module: { templateUrl: 'partial/vessel/vessel.html' } },
            resolve: generalRouteResolves
        })
        .state('communication', {
            url: '/communication',
            views: { module: { templateUrl: 'partial/mobileTerminal/mobileTerminal.html' } },
            resolve: generalRouteResolves
        })
        .state('communication-id', {
            url: '/communication/:id',
            views: { module: { templateUrl: 'partial/mobileTerminal/mobileTerminal.html' } },
            resolve: generalRouteResolves
        })
        .state('polling', {
            url: '/polling',
            views: { module: { templateUrl: 'partial/polling/polling.html' } },
            resolve: generalRouteResolves
        })
        .state('pollingLogs', {
            url: '/polling/logs',
            views: { module: { templateUrl: 'partial/polling/pollingLogs/pollingLogs.html' } },
            resolve: generalRouteResolves
        })
        .state('manualMovements', {
            url: '/movement/manual',
            views: { module: { templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html' } },
            resolve: generalRouteResolves
        })
        .state('auditLog', {
            url: '/admin/auditlog',
            views: { module: { templateUrl: 'partial/admin/adminLog/adminLog.html' } },
            resolve: generalRouteResolves
        })
        .state('configuration', {
            url: '/admin/configuration',
            views: { module: { templateUrl: 'partial/admin/adminConfiguration/adminConfiguration.html' } },
            resolve: generalRouteResolves
        })
        .state('admin', {
            url: '/admin',
            views: { module: { templateUrl: 'partial/admin/adminLog/adminLog.html' } },
            resolve: generalRouteResolves
        })
        .state('reporting', {
            url: '/reporting',
            views: { module: { templateUrl: 'partial/spatial/spatial.html' } },
            // resolve: generalRouteResolves
        })
        .state('exchange', {
            url: '/exchange',
            views: { module: { templateUrl: 'partial/exchange/exchange.html' } },
            resolve: generalRouteResolves
        })
        .state('holdingTable', {
            url: '/alarms/holdingtable',
            views: { module: { templateUrl: 'partial/alarms/holdingTable/holdingTable.html' } },
            resolve: generalRouteResolves
        })
        .state('openTickets', {
            url: '/alarms/opentickets',
            views: { module: { templateUrl: 'partial/alarms/openTickets/openTickets.html' } },
            resolve: generalRouteResolves
        })
        .state('rules', {
            url: '/alarms/rules',
            views: { module: { templateUrl: 'partial/alarms/rules/rules.html' } },
            resolve: generalRouteResolves
        });                            
});

angular.module('unionvmsWeb').run(function($rootScope, alertService) {

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

    //Handle state change error
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
        var message = 'Error showing page.',
            errorMessage = 'Error message';

        if(angular.isDefined(error)){
            message += ' ' + errorMessage +': ' +error;
        }

        //Show error alert
        alertService.showErrorMessage(message);
    });

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
                'audit',
                'movement',
                'config',
                'spatial',
                'datatables',
                'exchange',
                'alarms'
            ]);
        },
    };

    return initService;
});