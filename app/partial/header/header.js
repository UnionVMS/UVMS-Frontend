angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $log, $state, $rootScope, $location, $localStorage, userService, renewloginpanel, infoModal, configurationService, selectContextPanel, startPageService, tmhDynamicLocale, locale, $cookieStore, localeSupported, languageNames, localeConf,openAlarmsAndTicketsService, globalSettingsService){
    $scope.user = {};
    $scope.languages = localeSupported;
    $scope.selectedLanguage = tmhDynamicLocale.get();
    $scope.languageNames = languageNames;
    var availableLanguages = globalSettingsService.getAvailableLanguages();

    //Language is available according to the global settings?
    $scope.languageIsAvailable = function(lang){
        return angular.isDefined(availableLanguages) && availableLanguages.indexOf(lang) >= 0;
    };

    $scope.setLanguage = function(lang) {
        tmhDynamicLocale.set(lang);
        locale.setLocale(lang);
        moment.locale(lang);
        $state.go($state.$current, null, {reload: true});
    };

    $scope.userFlagIconClass = function() {
        if ($scope.selectedLanguage) {
            var parts = $scope.selectedLanguage.split("-");
            if (parts.length > 1) {
                return "flag-icon-" + parts[1].toLowerCase();
            }
            else if (parts.length > 0) {
                return "flag-icon-" + parts[0].toLowerCase();
            }
        }
    };

    var init = function(){
        $scope.userName = userService.getUserName();
        $scope.isAuthenticated = userService.isLoggedIn();
        $scope.contexts = userService.getContexts();
        $scope.currentContext = userService.getCurrentContext();
        $scope.numberOfOpenAlarmsAndTickets = openAlarmsAndTicketsService.getCount();

        //Check that current language is available
        if(!$scope.languageIsAvailable($scope.selectedLanguage)){
            //Change to default lang
            $scope.setLanguage(localeConf.defaultLocale);
        }
    };
    init();
    $rootScope.$on('AuthenticationSuccess', function () {
        init();
    });
    $rootScope.$on('needsAuthentication', function () {
        init();
    });
    $rootScope.$on('ContextSwitch', function () {
        init();
        openAlarmsAndTicketsService.restart();
    });

    $scope.getUser = function(){
        $scope.user.name = "Antonia";
        $scope.user.name = userService.getUserName();

        $scope.user.email = "antonia@havsochvattenmyndigheten.se";

    };

    $scope.getUser();

    $scope.signOut = function(){
        init();
        $state.go('uvmsLogout');
    };

    $scope.signIn = function(){
        $state.go('uvmsLogin');
    };

    $scope.switchContext = function(){
        selectContextPanel.show().then(
            function(selectedContext){
                userService.setCurrentContext(selectedContext);
                init();
            },
            function(error){

                init();
                $log.error(error);
            });
    };

    //TODO: REMOVE THIS, ITS JUST USED FOR SHOWING FEATURES DURING DEVELOPMENT
    $scope.showFeatures = function(){
        var features = $scope.contexts.reduce(function(features, context){
            return features.concat(context.role.features);
        }, []);

        features = $scope.currentContext.role.features.slice(0);

        //Sort the features
        features = _.sortBy(features, function(aFeature) {
          return [aFeature.applicationName, aFeature.featureName].join("_");
        });

        //Create html to show in modal
        features = features.reduce(function(message, aFeature){
            message += aFeature.applicationName +" - " + aFeature.featureName +'<br>';
            return message;
        }, '');

        var options = {
            titleLabel: "Features",
            textLabel: features
        };

        infoModal.open(options);
    };

    $scope.viewNotifications = function(){
        var notificationState;
        //Go to alarms page if there are any open alarms
        if($scope.numberOfOpenAlarmsAndTickets.alarms > 0){
            notificationState = 'app.holdingTable';
        }else if($scope.numberOfOpenAlarmsAndTickets.tickets > 0){
            notificationState = 'app.openTickets';
        }
        //Reload state? Necessary when loading the same page we already are viewing
        var reload = false;
        var currentState = $state.$current;
        if(currentState.name === notificationState){
            reload = true;
        }
        $state.go(notificationState, {}, {reload: reload});
    };

    //Go to the start page
    $scope.gotoStartPage = function(){
        var homeState = startPageService.getStartPageStateName();
        $state.go(homeState, {});
    };
});
