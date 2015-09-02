var unionvmsWebApp = angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize', 'tmh.dynamicLocale', 'leaflet-directive', 'datatables', 'datatables.bootstrap', 'datatables.columnfilter', 'ngCsv', 'ui.router', 'usm']);

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
    currentUser: getCurrentUserPromise() // TODO: Uncomment to enforce user login
};

unionvmsWebApp.config(function($stateProvider, tmhDynamicLocaleProvider, $injector) {

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

unionvmsWebApp.run(function($rootScope, alertService) {

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
unionvmsWebApp.value('localeConf', {
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
unionvmsWebApp.factory('initService',function(configurationService, locale, tmhDynamicLocale, $window) {

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

//Request interceptor that routes REST api request to the REST api server
unionvmsWebApp.config(function ($httpProvider) {
    //URLs that should go the REST apis
    var restApiURLS = [
        '/vessel/rest',
        '/mobileterminal/rest/',
        '/exchange/rest/',
        '/movement/rest/',
        '/audit/rest/',
        '/rules/rest/',
        '/reporting/rest/'
      //  '/usm-authentication/rest', '/usm-authorisation/rest', '/usm-administration/rest'
    ];

    $httpProvider.interceptors.push(function ($q, envConfig, $log) {
         return {
            'request': function (request) {
                var isRESTApiRequest = false;
                $.each(restApiURLS, function(i, val){
                    if(request.url.indexOf(val) === 0){
                        isRESTApiRequest = true;
                        return false;
                    }
                });
                //Change request url
                if(isRESTApiRequest){
                    var restAPIBaseUrl = envConfig.rest_api_base;
                    var newUrl = restAPIBaseUrl + request.url;
                    $log.debug("Reroute request to " + request.url +" to " +newUrl);
                    request.url = newUrl;
                }

                return request || $q.when(request);
            }
         };
    });
});

///Bootstrap the application by getting the environment config that points out the REST api URL
var envConfigJsonPath = "config.json";

function handleEnvironmentConfigurationError(error, $log){
    $log.error("Error loading environment configuration.", error);
    if(angular.isDefined(error.status) && angular.isDefined(error.statusText)){
        error = error.status + " : " +error.statusText;
    }
    if(typeof error !== 'string'){
        error = "";
    }
    $('#appLoading').remove();
    $("body").append('<div class="appErrorContainer"><i class="fa fa-exclamation-triangle"></i> Error loading environment configuration<div>' +error +'</div></div>');
}

function getEnvironmentConfig(envConfig) {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    var $log = initInjector.get("$log");
    var $q = initInjector.get("$q");

    var deferred = $q.defer();

    $http.get(envConfigJsonPath).then(function(response) {
        $log.debug(response.data);
        var envConfig = response.data;
        unionvmsWebApp.constant("envConfig", envConfig);
        //Verify that rest_api_base is available in the config
        if(angular.isUndefined(envConfig) || angular.isUndefined(envConfig.rest_api_base)){
            var error ="rest_api_base is missing from the configuration file.";
            handleEnvironmentConfigurationError(error, $log);
            deferred.reject(error);
            return;
        }
        $('#appLoading').remove();
        deferred.resolve();
    }, function(error) {
        handleEnvironmentConfigurationError(error, $log);
        deferred.reject(error);
    });

    return deferred.promise;
}

function bootstrapApplication() {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ["unionvmsWeb"]);
    });
}
getEnvironmentConfig().then(bootstrapApplication);