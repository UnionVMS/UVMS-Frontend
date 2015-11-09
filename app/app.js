var unionvmsWebApp = angular.module('unionvmsWeb', [
    'ui.bootstrap',
    'ui.utils',
    'ngRoute',
    'ngAnimate',
    'ngResource',
    'ngLocalize',
    'tmh.dynamicLocale',
    'leaflet-directive',
    'datatables',
    'datatables.bootstrap',
    'datatables.columnfilter',
    'ngCsv',
    'ui.router',
    'usm',
    'googlechart',
    'ngWebSocket',
    'checklist-model'
]);

var currentUserContextPromise = function(userService, $q) {
    return userService.findSelectedContext();
};
currentUserContextPromise.$inject = ['userService', '$q'];


var loadLocales = function(initService) {
    return initService.loadLanguageFiles();
};


unionvmsWebApp.config(function($stateProvider, tmhDynamicLocaleProvider, $injector, $urlRouterProvider, ACCESS) {

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

    var homeState = 'app.exchange';
    var homeUrl = 'exchange';

    $urlRouterProvider.when('', homeUrl);

    $stateProvider
        .state('uvmsLogin', {
            url: '/login',
            params: {
                toState: {
                    value: function () {
                        return homeState;
                    }
                },
                toParams: null,
                message: "Login required"
            },
            data: {access: ACCESS.PUBLIC},
            views: {
                app: {
                    templateUrl: 'partial/login/login.html',
                    controller: 'uvmsLoginController'
                }
            }
        })
        .state('uvmsLogout', {
            url: '/logout',
            params: {
                loginState: 'uvmsLogin',
                logoutMessage: "You have been logged out."
            },
            data: {access: ACCESS.PUBLIC},
            views: {
                app: {
                    templateUrl: 'partial/login/logout.html',
                    controller: 'uvmsLogoutController'
                }
            }
        })
        .state('uvmsAccessError', {
            url: '/accessError',
            data: {access: ACCESS.PUBLIC},
            views: {
                app: {
                    templateUrl: 'partial/accessDenied/accessDenied.html',
                    controller: 'accessDeniedCtrl'
                }
            }
        })
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
                }
            },
            data: {
                access: ACCESS.AUTH
            },
            resolve: {
                currentContext : currentUserContextPromise,
                locales : loadLocales
            }
        })
        .state('uvmsheader', {
            views: {
                unionvmsHeader: {
                    templateUrl: 'partial/header/header.html',
                    controller: 'HeaderCtrl'
                }
            }
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
            resolve: {},
            data: {
                access: 'viewMovements'
            },
        })
        .state('app.movement-id', {
            url: '/movement/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/movement.html',
                    controller: 'MovementCtrl'
                }
            },
            resolve: {},
            data: {
                access: 'viewMovements'
            },
        })
        .state('app.manualMovements', {
            url: '/movement/manual',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html',
                    controller: 'ManualPositionReportsCtrl'
                }
            },
            data: {
                access: 'viewManualMovements'
            },
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
            }
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
            }
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
            },
            data: {
                access: 'viewVesselsAndMobileTerminals'
            },
        })
        .state('app.polling', {
            url: '/polling',
            views: {
                modulepage: {
                    templateUrl: 'partial/polling/newPollWizard/newPollWizard.html',
                    controller: 'newPollWizardCtrl'
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
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["EXCHANGE", "MOBILE_TERMINAL_TRANSPONDERS"]);
                }
            },
            data: {
                access: 'viewMobileTerminalPolls'
            },
        })
        .state('app.pollingLogs-id', {
            url: '/polling/logs/:id',
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
            resolve: {
                /*config : function(initService){
                    return initService.loadConfigFor(["AUDIT"]);
                }*/
            },
            data: {
                access: 'viewAudit'
            },
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
        .state('app.reporting', {
            url: '/reporting',
            views: {
                modulepage: {
                    templateUrl: 'partial/spatial/spatial.html',
                    controller: 'SpatialCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["MOVEMENT"]);
                }
            }
        })
        .state('app.exchange', {
            url: '/exchange',
            views: {
                modulepage: {
                    templateUrl: 'partial/exchange/exchange.html',
                    controller: 'ExchangeCtrl'
                }
            },
            resolve: {
                 config : function(initService){
                    return initService.loadConfigFor(["EXCHANGE"]);
                }
            },
            data: {
                access: 'viewExchange'
            },
        })
        .state('app.holdingTable', {
            url: '/alarms/holdingtable',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/holdingTable/holdingTable.html',
                    controller: 'HoldingtableCtrl'
                }
            },
            resolve: {},
            data: {
                access: 'viewAlarmsHoldingTable'
            },
        })
        .state('app.openTickets', {
            url: '/alarms/notifications',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/openTickets/openTickets.html',
                    controller: 'OpenticketsCtrl'
                }
            },
            resolve: {},
            data: {
                access: 'viewAlarmsOpenTickets'
            },
        })
        .state('app.rules', {
            url: '/alarms/rules',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/rules/rules.html',
                    controller: 'RulesCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["RULES", "RULES_RESERVED_WORDS"]);
                }
            },
            data: {
                access: 'viewAlarmsRules'
            },
        })
        .state('app.rules-id', {
            url: '/alarms/rules/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/rules/rules.html',
                    controller: 'RulesCtrl'
                }
            },
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["RULES", "RULES_RESERVED_WORDS"]);
                }
            },
            data: {
                access: 'viewAlarmsRules'
            },
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
            }
        });

});

unionvmsWebApp.run(function($log, $rootScope, $state, $timeout, errorService, userService, locale, httpPendingRequestsService) {
    //Never cancel these request
    httpPendingRequestsService.setSkipList(['/translate/locale-', '.lang.json']);

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

    //Show spinner after 600ms when loading page if page hasn't loaded
    $rootScope.loadingPage = false;
    $rootScope.loadingPageIconHidden = false;
    var showPageNavigationSpinnerTimeout;
    var showSpinnerAfterMilliSeconds = 600;

    //Handle state change start
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, $modalStack) {
        //Cancel http requests on page navigation
        if (toState.url !== fromState.url) {
            httpPendingRequestsService.cancelAll();
        }

        $timeout.cancel(showPageNavigationSpinnerTimeout);
        //Only show spinner if user is logged in
        if(userService.isLoggedIn()){
            showPageNavigationSpinnerTimeout = $timeout(function(){
                //Hide spinner icon and text when no context selected
                if(!userService.getCurrentContext()){
                    $rootScope.loadingPageIconHidden = true;
                }
                else{
                    $rootScope.loadingPageIconHidden = false;
                }
                $rootScope.loadingPageMessage = locale.getString('common.loading_page');
                $rootScope.loadingPage = true;
            }, showSpinnerAfterMilliSeconds);
        }
    });

    //Handle state change success
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $timeout.cancel(showPageNavigationSpinnerTimeout);
        $rootScope.loadingPage = false;
    });

    //Handle state change error
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
        $timeout.cancel(showPageNavigationSpinnerTimeout);
        $rootScope.loadingPage = false;

        var message = locale.getString('common.loading_page_error'),
            errorMessage = locale.getString('common.loading_page_error_message');

        if(angular.isDefined(error)){
            message += '. ' + errorMessage +': ' +error;
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

//Configure locale in momentjs (used to determine start of week)
//TODO: get locale from config or browser
moment.locale('en');

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

//URLs that should go the REST apis
var restApiURLS = [
    '/vessel/rest',
    '/mobileterminal/rest/',
    '/exchange/rest/',
    '/exchange/activity/',
    '/movement/rest/',
    '/movement/activity',
    '/config/rest',
    '/audit/rest/',
    '/rules/rest/',
    '/rules/activity/',
    '/reporting/rest/',
    '/spatial/rest/',
    '/usm-authentication/rest', '/usm-authorisation/rest', '/usm-administration/rest'
];

//Request interceptor that routes REST api request to the REST api server
unionvmsWebApp.factory('HttpRequestRESTCallInterceptor', function ($q, envConfig, $log) {
    return {
      request: function (request) {
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

//Add HTTP request interceptors
unionvmsWebApp.config(function ($httpProvider) {
    //Authenticated?
    $httpProvider.interceptors.push('authInterceptor');
    //Store request to be able to cancel it
    $httpProvider.interceptors.push('HttpRequestTimeoutInterceptor');
    //Update URL for REST api calls
    $httpProvider.interceptors.push('HttpRequestRESTCallInterceptor');
});


//Config authInterceptor
unionvmsWebApp.config(['$httpProvider', 'authInterceptorProvider', function Config($httpProvider, authInterceptorProvider, $log) {
    // Please note we're annotating the function so that the $injector works when the file is minified
    //Dont show renew panel
    authInterceptorProvider.injectPanel = false;

/*    authInterceptorProvider.authFilter = ['config', '$log', function (config, $log) {
        //myService.doSomething();

        var skipURL = /^(template|usm|assets|common).*?\.(html|json)$/i.test(config.url);
        var logmsg = skipURL?'SKIPPING':'setting auth';
        $log.debug('authFilter '+ logmsg +' on url :' + config.url);
        return skipURL;
    }];*/

}]);

//Config login/logout
unionvmsWebApp.config(['authRouterProvider',function(authRouterProvider){
    //authRouterProvider.anonRoute = "/anon";
    //authRouterProvider.setHomeState("app.today");
    authRouterProvider.setLogoutState("uvmsLogout");
    authRouterProvider.setupAccessErrorState("uvmsAccessError");
    //sets up a 'login' state that creates a default login page.
    // can be customised by either passing the name of an existing state that must be used for the login page
    // or by passing a complete state config object

    authRouterProvider.useLoginPage('uvmsLogin');
}]);

//Handle error durring app startup
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

///Bootstrap the application by getting the environment config that points out the REST api URL
var envConfigJsonPath = "config.json?ts=" +(new Date()).getTime();

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