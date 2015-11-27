//Start controller
angular.module('unionvmsWeb').controller('StartCtrl', function($scope, $log, $state, startPageService) {
    //Get the start state from the global settings and redirect to that state
    var homeState = startPageService.getStartPageStateName();
    $state.go(homeState, {}, {location: 'replace'});
});

angular.module('unionvmsWeb').factory('startPageService',function($log, globalSettingsService, userService) {

    var unionVMSApplication = 'Union-VMS';
    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature,module,true);
    };

    //Matches pages (in global config) with states in the app
    //Order of pages and states are of importance only when user don't have access to the homepage set in the global config
    var pagesAndStates = {
        exchange : ['app.exchange'],
        positions : ['app.movement'],
        polling : ['app.pollingLogs'],
        mobileTerminals : ['app.communication'],
        assets : ['app.assets'],
        alarms : ['app.holdingTable', 'app.openTickets'],
        admin : ['app.auditLog'],
        user : ['app.usm.users'],
        reporting : ['app.reporting'],
    };

    var userHasAccessToState = function(state){
        var accessToAssetsAndTerminals = checkAccess(unionVMSApplication, 'viewVesselsAndMobileTerminals');

        switch(state){
            case 'app.movement':
                return checkAccess('Movement', 'viewMovements') && accessToAssetsAndTerminals;
            case 'app.exchange':
                return checkAccess('Exchange', 'viewExchange');
            case 'app.pollingLogs':
                return checkAccess(unionVMSApplication, 'viewMobileTerminalPolls') && accessToAssetsAndTerminals;
            case 'app.communication':
                return accessToAssetsAndTerminals;
            case 'app.assets':
                return accessToAssetsAndTerminals;
            case 'app.holdingTable':
                return checkAccess(unionVMSApplication, 'viewAlarmsHoldingTable');
            case 'app.openTickets':
                return checkAccess(unionVMSApplication, 'viewAlarmsOpenTickets');
            case 'app.auditLog':
                return checkAccess('Audit', 'viewAudit');
            case 'app.usm.users':
                return checkAccess('USM', 'viewUsers');
            case 'app.usm.users':
                return checkAccess('Reporting', 'LIST_REPORTS');
            default:
                $log.info("State: " +state +" is missing from list. Returning false.");
                return false;
        }
    };

    var startPageService = {
        getStartPageStateName : function(){
            var defaultHomePage = globalSettingsService.get('defaultHomePage', false);
            var possibleStates, i;

            //Check if user has access to the defaultHomePage
            if(defaultHomePage in pagesAndStates){
                possibleStates = pagesAndStates[defaultHomePage];
                for (i=0; i< possibleStates.length; i++){
                    if(userHasAccessToState(possibleStates[i])){
                        return possibleStates[i];
                    }
                }
            }

            //User didn't have access to the default home page, so lets find first page user has access to
            $log.info("Default home page is set to '" +defaultHomePage +"' but user don't have access to this page. Redirecting to first page user has access to.");
            for (var page in pagesAndStates) {
                if (pagesAndStates.hasOwnProperty(page)) {
                    possibleStates = pagesAndStates[page];
                    for (i = 0; i< possibleStates.length; i++){
                        if(userHasAccessToState(possibleStates[i])){
                            return possibleStates[i];
                        }
                    }
                }
            }

            //No access, just return exchange page
            $log.warn("User don't have access to any page. Return access error.");
            return 'uvmsAccessError';
        }
    };

    return startPageService;
});