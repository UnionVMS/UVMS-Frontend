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
		'policies',
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
    nations: ['BEL', 'EEC', 'FRA', 'GRC', 'SWE'],
    securityQuestions: ['What is the last name of the teacher who gave you your first failing grade?',
                        'What was the name of your elementary / primary school?',
                        'In what city or town does your nearest sibling live?',
                        'What time of the day were you born? (hh:mm)',
                        'What is your favourite movie?',
                        'What was the model of your first car?',
                        'What is the first name of your oldest cousin?',
                        'What was the name of your first pet?',
                        'What was the name of the of street where you grew up?',
                        "What is your mother's maiden name?"
                        ],
    activeDateTo: '2999-01-01',
    minCalendarDate: '1990-01-01',
    maxCalendarDate: '2999-01-01',
    toolTipsDelay: 2000
});

userManagementApp.config(['$translateProvider','LOCALES', function ($translateProvider, LOCALES) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'usm/assets/translate/locale-',
        suffix: '.json'
    })
        //let's make sure that unsupported languages fallback to english
        .fallbackLanguage('en');
}]);

userManagementApp.config(['$logProvider','policyValuesProvider', function ($logProvider, policyValues) {

    $logProvider.debugEnabled(true);
    /* configure policyValuesProvider if necessary
    policyValues.setPolicyName("");
    policyValues.setPolicySubject("");
    */

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


    $urlRouterProvider.when('','usm');
    $urlRouterProvider.when('/usm','usm/home');
        //trying a fix to https://github.com/angular-ui/ui-router/issues/600
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
        var currentContextPromise = function(userService){
            return userService.findSelectedContext();
        };
        currentContextPromise.$inject =    ['userService'];


        var getMenuTemplate = function(){
            if(typeof unionvmsWebApp !== 'undefined'){
                return 'usm/shared/partial/menu/integrated-menu.html';
            } else{
                return 'usm/shared/partial/menu/menu.html';
            }
        };

    $stateProvider
        .state('app.usm', {
            url: '/usm',
            views: {
                "modulenav": {
                    templateUrl: getMenuTemplate(),
                    controller: "MenuCtrl"
                },
                "modulepage": {
                    templateUrl: 'usm/usm.html'
                }
            },
            ncyBreadcrumb: {
                label: 'USM'
            }
        })
        .state('app.usm.home', {
            url: '/home',
            views: {

                "page@app.usm": {
                    templateUrl: 'usm/home/home.html'
                }

            },
            ncyBreadcrumb: {
                label: 'home'
            },
            resolve:{
                currentContext: currentContextPromise
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
            //TODO: check that this is one of the supported languages. If the navigator preferred language is not
            $cookies.lang = lang;
        }
        $translate.use(lang);

        // Check if current user exist
        // cookie is preserved between tabs
        // session storage is NOT preserve between tabs
        /*if ($localStorage.token) {
            userService.login($localStorage.token);
        } else {
            // reset session in case the log out have done in another tab
            $localStorage.token = null;
            //$rootScope.$broadcast('event:loginRequired');
        }*/
    }]);










