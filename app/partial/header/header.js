/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $log, $state, $rootScope, $location, breadcrumbService, $localStorage, userService, renewloginpanel, infoModal, configurationService, selectContextPanel, startPageService, tmhDynamicLocale, locale, $cookies, localeSupported, languageNames, localeConf,openAlarmsAndTicketsService, globalSettingsService){
    $scope.user = {};
    $scope.languages = localeSupported;
    $scope.selectedLanguage = tmhDynamicLocale.get();
    $scope.languageNames = languageNames;
    $scope.appState = $state.current.name;
    //AvailableLanguages holds list of languages that are selected in settings and exists in localeSupported
    var availableLanguages = globalSettingsService.getAvailableLanguages();

    if(angular.isDefined(globalSettingsService.getHeaderTemplate())){
        $scope.headerTemplate = globalSettingsService.getHeaderTemplate().toUpperCase();
    }
    
    //Remove langs from availableLanguages if they don't exists in localeSupported
    for (var i = availableLanguages.length - 1; i >= 0; i--) {
        if($scope.languages.indexOf(availableLanguages[i]) < 0){
            availableLanguages.splice(i, 1);
        }
    }

    //Language is available according to the global settings or default lang in app js?
    $scope.languageIsAvailable = function(lang){
        if(Array.isArray(availableLanguages) && availableLanguages.length > 0){
            return angular.isDefined(availableLanguages) && availableLanguages.indexOf(lang) >= 0;
        }else{
            return lang === localeConf.defaultLocale;
        }

    };

    $scope.setLanguage = function(lang) {
        tmhDynamicLocale.set(lang);
        locale.setLocale(lang);
        moment.locale(lang);

        // TODO: Fix UV-346 (https://jira.havochvatten.se/jira/browse/UV-346)
        // Setting a language on stratup shoulnd't cause a reload of the app.
        // The default language should be given on initial startup from the configuration.
        // Otherwise we are calling initialize twice on the page which is completely unnecessary
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
            //Change to first available lang
            if(Array.isArray(availableLanguages) && availableLanguages.length > 0){
                $scope.setLanguage(availableLanguages[0]);
            }else{
                $scope.setLanguage(localeConf.defaultLocale);
            }
        }        
    };
    init();
    var removeAuthenticationSuccess = $rootScope.$on('AuthenticationSuccess', function () {
        init();
    });
    var removeNeedsAuthentication = $rootScope.$on('needsAuthentication', function () {
        init();
    });
    var removeContextSwitch = $rootScope.$on('ContextSwitch', function () {
        init();
        openAlarmsAndTicketsService.restart();
    });

    var removeHoldingTableSearchResultsUpdated = $rootScope.$on('holdingTable_searchResultsUpdated', function(event){
        openAlarmsAndTicketsService.getUpdatedCounts();
    });

    var removeTicketsTableSearchResultsUpdated = $rootScope.$on('openTickets_searchResultsUpdated', function(event){
        openAlarmsAndTicketsService.getUpdatedCounts();
    });

    var removeRulesTableSearchResultsUpdated = $rootScope.$on('rulesTableDetails_searchResultsUpdated', function(event){
        openAlarmsAndTicketsService.getUpdatedCounts();
    });

    $scope.getUser = function(){
        $scope.user.name = userService.getUserName();
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

    // Un-register the events when destroying controller
    $scope.$on('$destroy', function () {
        removeAuthenticationSuccess();
        removeNeedsAuthentication();
        removeContextSwitch();
        removeHoldingTableSearchResultsUpdated();
        removeTicketsTableSearchResultsUpdated();
        removeRulesTableSearchResultsUpdated();
    });

});