var unionvmsWebApp = angular.module('unionvmsWeb', ['ui.bootstrap','ui.utils','ngRoute','ngAnimate','ngResource', 'ngLocalize', 'tmh.dynamicLocale', 'leaflet-directive', 'datatables', 'datatables.bootstrap', 'datatables.columnfilter', 'ngCsv', 'ui.router', 'usm','googlechart', 'ngWebSocket']);

var getCurrentUserContextPromise = function() {
    var currentUserContextPromise = function(userService) {
        return userService.findSelectedContext();
    };

    currentUserContextPromise.$inject = ['userService'];
    return currentUserContextPromise;
};


var loadLocales = function(initService) {
    return initService.loadLanguageFiles();
};


unionvmsWebApp.config(function($stateProvider, tmhDynamicLocaleProvider, $injector, $urlRouterProvider, ACCESS) {

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

	
    $urlRouterProvider.when('','today');

    $stateProvider
        .state('app', {
            abstract : true,
            views: {
                app: {
                    template: '<div ui-view name="modulenav"></div><div ui-view name="modulepage"></div><div ui-view name="page"></div>',
                },
                unionvmsHeader: {
                    templateUrl: 'partial/header/header.html',
                    controller: 'HeaderCtrl'
                },
                unionvmsFooter: {
                    templateUrl: 'partial/footer/footer.html',
                    controller: 'FooterCtrl'
                },
                unionvmsAlerts: {
                    templateUrl: 'partial/alerts/alerts.html',
                    controller: 'AlertsCtrl'
                },
            },
            data: {
                access: ACCESS.AUTH
            },
            resolve: {
                currentContext : getCurrentUserContextPromise,
                locales : loadLocales
            }
        })
        .state('uvmsheader', {
            views: {
                unionvmsHeader: {
                    templateUrl: 'partial/header/header.html',
                    controller: 'HeaderCtrl'
                }
            },
        })
        .state('app.today', {
            url: '/today',
            views: {
                modulepage: {
                    templateUrl: 'partial/today/today.html',
                    controller: 'TodayCtrl'
                }
            },
            resolve: {}
        })
        .state('app.movement', {
            url: '/movement',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/movement.html',
                    controller: 'MovementCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["MOVEMENT","VESSEL"]);
                }
            }
        })
        .state('app.movement-manual', {
            url: '/movement/manual',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html',
                    controller: 'ManualPositionReportsCtrl'
                }
            },
            resolve: {}
        })
        .state('app.movement-id', {
            url: '/movement/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/movement.html',
                    controller: 'MovementCtrl'
                }
            },
            resolve: {}
        })
        .state('app.manualMovements', {
            url: '/movement/manual',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html',
                    controller: 'ManualPositionReportsCtrl'
                }
            },
            resolve: {}
        })
        .state('app.assets', {
            url: '/assets',
            views: {
                modulepage: {
                    templateUrl: 'partial/vessel/vessel.html',
                    controller: 'VesselCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["VESSEL"]);
                }
            },
            data: {
                access: 'viewVesselsAndMobileTerminals'
            },
        })
        .state('app.assets-id', {
            url: '/assets/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/vessel/vessel.html',
                    controller: 'VesselCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["VESSEL"]);
                }
            },
            data: {
                access: 'viewVesselsAndMobileTerminals'
            },
        })
        .state('app.communication', {
            url: '/communication',
            views: {
                modulepage: {
                    templateUrl: 'partial/mobileTerminal/mobileTerminal.html',
                    controller: 'MobileTerminalCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["MOBILETERMINAL", "MOBILE_TERMINAL_TRANSPONDERS", "MOBILE_TERMINAL_CHANNELS", "VESSEL"]);
                }
            },
            data: {
                access: 'viewVesselsAndMobileTerminals'
            },
        })
        .state('app.communication-id', {
            url: '/communication/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/mobileTerminal/mobileTerminal.html',
                    controller: 'MobileTerminalCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["MOBILETERMINAL", "MOBILE_TERMINAL_TRANSPONDERS", "MOBILE_TERMINAL_CHANNELS", "VESSEL"]);
                }
            }
        })
        .state('app.polling', {
            url: '/polling',
            views: {
                modulepage: {
                    templateUrl: 'partial/polling/polling.html',
                    controller: 'PollingCtrl'
                }
            },
            resolve: {},
            data: {
                access: 'managePolls'
            },
        })
        .state('app.pollingLogs', {
            url: '/polling/logs',
            views: {
                modulepage: {
                    templateUrl: 'partial/polling/pollingLogs/pollingLogs.html',
                    controller: 'pollingLogsCtrl'
                }
            },
            resolve: {},
            data: {
                access: 'viewMobileTerminalPolls'
            },
        })
        .state('app.auditLog', {
            url: '/admin/auditlog',
            views: {
                modulepage: {
                    templateUrl: 'partial/admin/adminLog/adminLog.html',
                    controller: 'AuditlogCtrl'
                }
            },
            resolve: {}
        })
        .state('app.configuration', {
            url: '/admin/configuration',
            views: {
                modulepage: {
                    templateUrl: 'partial/admin/adminConfiguration/adminConfiguration.html',
                    controller: 'AuditconfigurationCtrl'
                }
            },
            resolve: {}
        })
        .state('app.admin', {
            url: '/admin',
            views: {
                modulepage: {
                    templateUrl: 'partial/admin/adminLog/adminLog.html',
                    controller: 'AuditlogCtrl'
                }
            },
            resolve: {}
        })
        .state('app.reporting', {
            url: '/reporting',
            views: {
                modulepage: {
                    templateUrl: 'partial/spatial/spatial.html',
                    controller: 'SpatialCtrl'
                }
            },
            resolve: {}
        })
        .state('app.exchange', {
            url: '/exchange',
            views: {
                modulepage: {
                    templateUrl: 'partial/exchange/exchange.html',
                    controller: 'ExchangeCtrl'
                }
            },
            resolve: {}
        })
        .state('app.holdingTable', {
            url: '/alarms/holdingtable',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/holdingTable/holdingTable.html',
                    controller: 'HoldingtableCtrl'
                }
            },
            resolve: {}
        })
        .state('app.openTickets', {
            url: '/alarms/opentickets',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/openTickets/openTickets.html',
                    controller: 'OpenticketsCtrl'
                }
            },
            resolve: {}
        })
        .state('app.rules', {
            url: '/alarms/rules',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/rules/rules.html',
                    controller: 'RulesCtrl'
                }
            },
            resolve: {}
        })
        .state('error', {
            views: {
                unionvmsError: {
                    templateUrl: 'partial/common/error/error.html',
                    controller: 'errorCtrl'
                },
                unionvmsHeader: {
                    templateUrl: 'partial/header/header.html',
                    controller: 'HeaderCtrl'
                },
                unionvmsFooter: {
                    templateUrl: 'partial/footer/footer.html',
                    controller: 'FooterCtrl'
                },
            },
            data: {
                access: ACCESS.PUBLIC
            },
        });

        //$urlRouterProvider.otherwise('/today');
});

unionvmsWebApp.run(function($log, $rootScope, $state, errorService) {

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
        var message = 'Error loading page.',
            errorMessage = ' Error message';

        if(angular.isDefined(error)){
            message += ' ' + errorMessage +': ' +error;
        }

        errorService.setErrorMessage(error);
        event.preventDefault();
        return $state.go('error');
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
        //Load the configurations
        loadConfigFor : function(modules){
            return configurationService.setup(modules);
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

unionvmsWebApp.config(['$httpProvider', 'authInterceptorProvider', 'envConfig', function Config($httpProvider, authInterceptorProvider, envConfig, $log) {
    // Please note we're annotating the function so that the $injector works when the file is minified

    /*authInterceptorProvider.authFilter = ['config', '$log', function (config, $log) {
        //myService.doSomething();

        var skipURL = /^(template|usm|assets).*?\.(html|json)$/i.test(config.url);
        var logmsg = skipURL?'SKIPPING':'setting auth';
        $log.debug('authFilter '+ logmsg +' on url :' + config.url);
        return skipURL;
    }];*/

    authInterceptorProvider.rest_api_base = envConfig.rest_api_base;
    $httpProvider.interceptors.push('authInterceptor');
}]);


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
        '/reporting/rest/',
        '/usm-authentication/rest', '/usm-authorisation/rest', '/usm-administration/rest'
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