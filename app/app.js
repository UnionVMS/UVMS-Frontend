var unionvmsWebApp = angular.module('unionvmsWeb', [
    'ui.bootstrap',
    'ui.utils',
    'ngRoute',
    'ngAnimate',
    'ngResource',
    'ngLocalize',
    'tmh.dynamicLocale',
    'leaflet-directive',
    'ngCsv',
    'ui.router',
    'usm',
    'googlechart',
    'checklist-model',
    'angularScreenfull',
	'ngCookies',
	'toggle-switch',
	'colorpicker.module',
	'ui.select',
	'ngMessages',
	'angularFileUpload',
	'dndLists',
	'lrDragNDrop',
	'dndLists',
	'ui.bootstrap-slider',
	'widget.assetsInZone',
    'transpondersNoTx',
    'unionvmsWeb.longPolling'
]);

var currentUserContextPromise = function(userService) {
    return userService.findSelectedContext();
};
currentUserContextPromise.$inject = ['userService'];

var getGlobalSettingsPromise = function(globalSettingsService) {
    return globalSettingsService.setup();
};
getGlobalSettingsPromise.$inject = ['globalSettingsService'];


var loadLocales = function(initService) {
    return initService.loadLanguageFiles();
};


unionvmsWebApp.config(function($stateProvider, $compileProvider, tmhDynamicLocaleProvider, $injector, $urlRouterProvider, ACCESS) {

    //Stops angular flooding console with debug info.
    //$compileProvider.debugInfoEnabled(false);

    tmhDynamicLocaleProvider.localeLocationPattern("assets/locales/angular-locale_{{locale}}.js");

    var homeState = 'app.home';
    var homeUrl = 'home';

    $urlRouterProvider.when('', homeUrl);
    $urlRouterProvider.otherwise('/home');

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
                globalSettings : getGlobalSettingsPromise,
                locales : loadLocales,
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
        .state('app.home', {
            url: '/home',
            views: {
                modulepage: {
                    templateUrl: 'partial/login/start.html',
                    controller: 'StartCtrl'
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
                    return initService.loadConfigFor(["MOVEMENT","VESSEL","MOVEMENT_SOURCE_TYPES"]);
                }
            },
            data: {
                access: 'viewMovements',
                pageTitle: 'movement.reports'
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
                access: 'viewManualMovements',
                pageTitle: 'movement.manual'
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
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["MOVEMENT","VESSEL"]);
                }
            },
            data: {
                access: 'viewMovements',
                pageTitle: 'movement.manual'
            },
        })
        .state('app.manualMovement-id', {
            url: '/movement/manual/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/movement/manualPositionReports/manualPositionReports.html',
                    controller: 'ManualPositionReportsCtrl'
                }
            },
            data: {
                access: 'viewManualMovements',
                pageTitle: 'movement.manual'
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
                    return initService.loadConfigFor(["VESSEL", "VESSEL_PARAMETERS"]);
                }
            },
            data: {
                access: 'viewVesselsAndMobileTerminals',
                pageTitle: 'assets'
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
                    return initService.loadConfigFor(["VESSEL", "VESSEL_PARAMETERS"]);
                }
            },
            data: {
                access: 'viewVesselsAndMobileTerminals',
                pageTitle: 'assets'
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
                access: 'viewVesselsAndMobileTerminals',
                pageTitle: 'mobileTerminals'
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
                access: 'viewVesselsAndMobileTerminals',
                pageTitle: 'mobileTerminals'
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
                access: 'managePolls',
                pageTitle: 'polling.new'
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
                access: 'viewMobileTerminalPolls',
                pageTitle: 'polling.logs'
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
            resolve: {
                config : function(initService){
                    return initService.loadConfigFor(["EXCHANGE", "MOBILE_TERMINAL_TRANSPONDERS"]);
                }
            },
            data: {
                access: 'viewMobileTerminalPolls',
                pageTitle: 'polling.logs'
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
                access: 'viewAudit',
                pageTitle: 'admin.auditLogs'
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
            resolve: {
            	config : function(initService){
	               return initService.loadConfigFor(["MOVEMENT"]);
	            }
            },
            data: {
                pageTitle: 'admin.configuration'
            }
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
            },
            data: {
                pageTitle: 'reports'
            }
        })
        .state('app.areas', {
            url: '/areas',
            views: {
                modulepage: {
                    templateUrl: 'partial/areas/areas.html',
                    controller: 'AreasCtrl'
                }
            },
            data: {
                pageTitle: 'areas'
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
                access: 'viewExchange',
                pageTitle: 'exchange'
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
            resolve: {
                 config : function(initService){
                    return initService.loadConfigFor(["ALARM_STATUSES"]);
                }
            },
            data: {
                access: 'viewAlarmsHoldingTable',
                pageTitle: 'alarms.holdingTable'
            },
        })
        .state('app.holdingTable-id', {
            url: '/alarms/holdingtable/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/holdingTable/holdingTable.html',
                    controller: 'HoldingtableCtrl'
                }
            },
            resolve: {
                 config : function(initService){
                    return initService.loadConfigFor(["ALARM_STATUSES"]);
                }
            },
            data: {
                access: 'viewAlarmsHoldingTable',
                pageTitle: 'alarms.holdingTable'
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
            resolve: {
                 config : function(initService){
                    return initService.loadConfigFor(["TICKET_STATUSES"]);
                }
            },
            data: {
                access: 'viewAlarmsOpenTickets',
                pageTitle: 'alarms.notifications'
            },
        })
        .state('app.openTickets-id', {
            url: '/alarms/notifications/:id',
            views: {
                modulepage: {
                    templateUrl: 'partial/alarms/openTickets/openTickets.html',
                    controller: 'OpenticketsCtrl'
                }
            },
            resolve: {
                 config : function(initService){
                    return initService.loadConfigFor(["TICKET_STATUSES"]);
                }
            },
            data: {
                access: 'viewAlarmsOpenTickets',
                pageTitle: 'alarms.notifications'
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
                    return initService.loadConfigFor(["RULES", "VESSEL", "MOBILETERMINAL", "MOBILE_TERMINAL_CHANNELS", "MOVEMENT", "MOVEMENT_SOURCE_TYPES"]);
                }
            },
            data: {
                access: 'viewAlarmsRules',
                pageTitle: 'alarms.rules'
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
                    return initService.loadConfigFor(["RULES", "VESSEL", "MOBILETERMINAL", "MOBILE_TERMINAL_CHANNELS", "MOVEMENT", "MOVEMENT_SOURCE_TYPES"]);
                }
            },
            data: {
                access: 'viewAlarmsRules',
                pageTitle: 'alarms.rules'
            },
        })
        .state('app.help', {
            url: '/help',
            views: {
                modulepage: {
                    templateUrl: 'partial/help/help.html',
                    controller: 'help.controller as help'
                }
            },
            data: {
                pageTitle: 'help'
            }
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
    httpPendingRequestsService.setSkipList(['/translate/locale-', '.lang.json', '/rules/activity', '/ping']);

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
    var loadingPageText = locale.getString('common.loading_page');
    var loadingPageLoggingInText = locale.getString('common.loading_page_logging_in');
    $rootScope.loadingPage = false;
    $rootScope.loadingPageIconHidden = false;
    $rootScope.loadingPageMessage = loadingPageText;
    var showPageNavigationSpinnerTimeout;
    var showSpinnerAfterMilliSeconds = 600;
    var waitingForUserPingResponse = false;

    //Handle authenticationNeeded
    $rootScope.$on('authenticationNeeded', function() {
        $log.info("Authentication needed. Logging out.");
        $state.go('uvmsLogout');
    });
    //Handle ping error
    $rootScope.$on('UserPingStart', function() {
        waitingForUserPingResponse = true;
        $rootScope.loadingPageIconHidden = false;
        $rootScope.loadingPageMessage = locale.getString('common.loading_page_logging_in');
    });
    $rootScope.$on('UserPingSuccess', function() {
        waitingForUserPingResponse = false;
        $rootScope.loadingPageMessage = loadingPageText;
    });
    $rootScope.$on('UserPingError', function() {
        $log.error("UserPingError");
        errorService.setErrorMessage(locale.getString('common.loading_page_error_logging_in'));
        return $state.go('error');
    });

    //Handle state change start
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, $modalStack) {
        var currentState = $state.$current;
        //Do nothing if new state is same as the old one
        if(currentState.name === toState.name){
            return;
        }

        //Cancel http requests on page navigation
        if (toState.url !== fromState.url) {
            httpPendingRequestsService.cancelAll();
        }

        $timeout.cancel(showPageNavigationSpinnerTimeout);
        //Only show spinner if user is logged in or waiting for ping request response
            showPageNavigationSpinnerTimeout = $timeout(function(){
                //Hide spinner icon and text when no context selected
            if(!userService.getCurrentContext() && !waitingForUserPingResponse){
                    $rootScope.loadingPageIconHidden = true;
                }
                else{
                    $rootScope.loadingPageIconHidden = false;
                }
            if(waitingForUserPingResponse){
                $rootScope.loadingPageMessage = locale.getString('common.loading_page_logging_in');
            }else{
                $rootScope.loadingPageMessage = locale.getString('common.loading_page');
            }
                $rootScope.loadingPage = true;
            }, showSpinnerAfterMilliSeconds);
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

        errorService.setErrorMessage(error);
        event.preventDefault();
        return $state.go('error');
    });
});

//Configure for i18n
unionvmsWebApp.value('localeConf', {
    basePath: 'i18n',
    defaultLocale: 'en-gb',
    sharedDictionary: 'common',
    fileExtension: '.lang.json?ts=' +(new Date()).getTime(),
    persistSelection: true,
    cookieName: 'COOKIE_LOCALE_LANG',
    observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
    delimiter: '::'
}).value('localeSupported', [
    "de-at",
    "nl-be",
    "bg-bg",
    "el-cy",
    "tr-cy",
    "cs-cz",
    "de-de",
    "da-dk",
    "et-ee",
    "es-es",
    "fi-fi",
    "fr-fr",
    "en-gb",
    "el-gr",
    "hr-hr",
    "hu-hu",
    "en-ie",
    "im-im",
    "it-it",
    "lt-lt",
    "fr-lu",
    "de-lu",
    "lv-lv",
    "mt",
    "nl",
    "pl",
    "pt-pt",
    "ro-ro",
    "si-si",
    "sk-sk",
    "sv"

    ]).constant('languageNames', {
    "de-at" : "German (Austria)",
    "nl-be" : "Dutch (Belgium)",
    "bg-bg" : "Bulgarian",
    "el-cy" : "Cyprus (Greek)",
    "tr-cy" : "Cyprus (Turkish)",
    "cs-cz" : "Czech",
    "de-de" : "German",
    "da-dk" : "Danish",
    "et-ee" : "Estonian",
    "es-es" : "Spainsh",
    "fi-fi" : "Finnish",
    "fr-fr" : "French",
    "en-gb" : "English (GB)",
    "el-gr" : "Greek",
    "hr-hr" : "Croatian",
    "hu-hu" : "Hungarian",
    "en-ie" : "English (Ireland)",
    "im-im" : "English (Island of man)",
    "it-it" : "Italian",
    "lt-lt" : "Lithuanian",
    "fr-lu" : "French (Luxembourg)",
    "de-lu" : "German (Luxembourg)",
    "lv-lv" : "Latvian",
    "mt" : "Maltese",
    "nl" : "Dutch",
    "pl" : "Polish",
    "pt-pt" : "Portuguese",
    "ro-ro" : "Romanian",
    "si-si" : "Slovenian",
    "sk-sk" : "Slovak",
    "sv": "Swedish"
});

//Service used for bootstrapping the application
unionvmsWebApp.factory('initService',function($log, configurationService, locale, tmhDynamicLocale, $window, $cookieStore, localeConf, languageNames) {
    var userLocale = $cookieStore.get('COOKIE_LOCALE_LANG') || $window.navigator.userLanguage || $window.navigator.language;
    //Check that the locale is available
    if(!(userLocale in languageNames)){
        $log.info("Locale " +userLocale +" is not available. Setting locale to " +localeConf.defaultLocale);
        $cookieStore.put('COOKIE_LOCALE_LANG', localeConf.defaultLocale);
        userLocale = localeConf.defaultLocale;
    }
    tmhDynamicLocale.set(userLocale);
    moment.locale(userLocale);

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
                'exchange',
                'alarms',
                'areas'
            ]);
        },
    };

    return initService;
});

//URLs that should go the REST apis
var restApiURLS = [
    '/asset/rest',
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
    '/mapfish',
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
        if(isRESTApiRequest && angular.isDefined(envConfig.rest_api_base)){
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
