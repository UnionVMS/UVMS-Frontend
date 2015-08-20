var userManagementApp = angular.module('usm',
    [
        'ui.bootstrap',
        'ui.utils',
        'ngRoute',
        'ngAnimate',
        'angular-locker',
        'angular-jwt',
        'pascalprecht.translate',
        'ui.router',
        'ui.router.tabs',
        'ncy-angular-breadcrumb',
        'smart-table',
        'ui.select',
        'ngSanitize',
        'users',
        'organisations',
        'roles',
        'scenarios',
        'scopes',
        'applications',
        'account',
        'shared',
        'preferences',
        'ngCookies',
        'ngStorage',
        'config',
        'auth'
        ]);

userManagementApp.constant('LOCALES', {
    'locales': {
        'en': 'English',
        'fr': 'French'
    },
    'preferredLocale': 'en'
});

userManagementApp.constant('refData', {
    statuses: ['all', 'E', 'D', 'L'],
    statusesNoAll: ['E', 'D', 'L'],
    statusesEnDis: ['E', 'D'],
    statusesSearch: ['all', 'E', 'D'],
    nations: ['BEL', 'EEC', 'FRA', 'GRE', 'SWE'],
    activeDateTo: '2999-01-01',
    minCalendarDate: '1990-01-01',
    maxCalendarDate: '2999-01-01',
    toolTipsDelay: 2000
});

userManagementApp.config(['$translateProvider','LOCALES',function ($translateProvider, LOCALES) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'usm/assets/translate/locale-',
        suffix: '.json'
    });

    // defaulting to english if the selected language is not supported
    $translateProvider.preferredLanguage('en');
}]);

userManagementApp.config(['$logProvider',function ($logProvider) {

    $logProvider.debugEnabled(true);

}]);

userManagementApp.controller('TranslateController', ['$translate', '$scope', '$cookies',
    function ($translate, $scope, $cookies) {
        $scope.lang = $cookies.lang?$cookies.lang:'en';
        $scope.changeLanguage = function (langKey) {
            $translate.use(langKey);
            $cookies.lang = langKey;
        };

    }]);

userManagementApp.config(['$urlRouterProvider', '$stateProvider','$urlMatcherFactoryProvider','$breadcrumbProvider','ACCESS','$injector',
    function ($urlRouterProvider, $stateProvider,$urlMatcherFactoryProvider,$breadcrumbProvider,ACCESS,$injector) {


    //$urlRouterProvider.when('','usm');
        //trying a fix to https://github.com/angular-ui/ui-router/issues/600
    //$urlRouterProvider.otherwise('usm');
    //    $urlRouterProvider.otherwise( function() {
    //        var $injector = arguments[0];
    //        var $state = $injector.get("$state");
    //        $state.go("app.usmotherwise");
    //    });


    $urlMatcherFactoryProvider.defaultSquashPolicy("value");
    // Setting a custom template for the breadcrumb to use ui-sref instead of href
    // with the aim of getting inherited params. This fails but keeping it as it might come in handy
    $breadcrumbProvider.setOptions({
        templateUrl: 'usm/shared/partial/breadcrumb/template.html'
    });

        var currentUserPromise = function(userService){
            return userService.findCurrentUser();
        };
        currentUserPromise.$inject =    ['userService'];
    $stateProvider
        .state('app.usm', {
            url: '/usm',
            views: {
                nav: {
                    templateUrl: 'usm/shared/partial/menu/menu.html',
                    controller:"MenuCtrl"
                },
                page: {
                    templateUrl: 'usm/home/home.html'
                }

            },
            ncyBreadcrumb: {
                label: 'USM'
            },
            resolve:{
                //currentUser:currentUserPromise
            }
        })
        .state('login', {
            url: '/login',
            views: {
                module: {
                    templateUrl: 'usm/shared/partial/login/login.html',
                    controller: 'LogincontrollerCtrl'
                }
            }
        });

}]);

userManagementApp.run(['$rootScope', '$location', '$log', '$http', '$localStorage', 'jwtHelper','$modalStack', '$cookies', '$translate', 'userService','routeProtection',
    function ($rootScope, $location, $log, $http, $localStorage, jwtHelper, $modalStack, $cookies, $translate, userService,routeProtection) {

        $rootScope.safeApply = function (fn) {
            var phase = $rootScope.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

       /* authorisation.getContexts().then(function(data) {
        $log.log(data);
        });*/
        routeProtection.setHome('app.usm');


        $rootScope.$on('event:loginRequired', function () {
                $modalStack.dismissAll();
                //$location.path("login");

        });

        $rootScope.$on('event:loginSuccessful', function () {
            // This will make the service load the rights, then when used again it will not call the backend
            //authorisation.getRights().then(function(data) {
                //console.log(data);
            //});
            $location.path("home");
        });

        //trying to detect the user's preferred language
        var lang;
        if($cookies.lang){
            lang = $cookies.lang;
        } else {
            lang = navigator.languages? navigator.languages[0] :(navigator.language || navigator.userLanguage);
            lang = lang.substr(0,2);
            $cookies.lang = lang;
        }
        $translate.use(lang);

        // Check if current user exist
        // cookie is preserved between tabs
        // session storage is NOT preserve between tabs
        if ($localStorage.token) {
            userService.login($localStorage.token);
        } else {
            // reset session in case the log out have done in another tab
            $localStorage.token = null;
            //$rootScope.$broadcast('event:loginRequired');
        }
    }]);

userManagementApp.config(['routeProtectionProvider',function(routeProtectionProvider){
    routeProtectionProvider.anonRoute = "/anon";
}]);

userManagementApp.config(['$httpProvider', 'authInterceptorProvider', function Config($httpProvider, authInterceptorProvider, $log) {
    // Please note we're annotating the function so that the $injector works when the file is minified

    authInterceptorProvider.authFilter = ['config', '$log', function (config, $log) {
        //myService.doSomething();

        var skipURL = /^(template|usm|assets).*?\.(html|json)$/i.test(config.url);
        var logmsg = skipURL?'SKIPPING':'setting auth';
        $log.debug('authFilter '+ logmsg +' on url :' + config.url);
        return skipURL;
    }];

    $httpProvider.interceptors.push('authInterceptor');
}]);







