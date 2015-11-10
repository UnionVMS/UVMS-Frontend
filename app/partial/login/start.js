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

    var startPageService = {
        getStartPageStateName : function(){
            var defaultHomePage = globalSettingsService.get('defaultHomePage', false);
            var homeState = 'app.today';
            switch(defaultHomePage){
                case 'positions':
                    if(checkAccess('Movement', 'viewMovements')){
                        homeState = 'app.movement';
                    }
                    break;
                case 'exchange':
                    if(checkAccess('Exchange', 'viewExchange')){
                        homeState = 'app.exchange';
                    }
                    break;
                case 'polling':
                    if(checkAccess(unionVMSApplication, 'viewMobileTerminalPolls')){
                        homeState = 'app.pollingLogs';
                    }
                    break;
                case 'mobileTerminals':
                    if(checkAccess(unionVMSApplication, 'viewVesselsAndMobileTerminals')){
                        homeState = 'app.communication';
                    }
                    break;
                case 'assets':
                    if(checkAccess(unionVMSApplication, 'viewVesselsAndMobileTerminals')){
                        homeState = 'app.assets';
                    }
                    break;
                case 'alarms':
                    if(checkAccess(unionVMSApplication, 'viewAlarmsHoldingTable')){
                        homeState = 'app.holdingTable';
                    }
                    else if(checkAccess(unionVMSApplication, 'viewAlarmsOpenTickets')){
                        homeState = 'app.openTickets';
                    }
                    break;
                case 'admin':
                    if(checkAccess('Audit', 'viewAudit')){
                        homeState = 'app.auditLog';
                    }
                    break;
                default:
                    $log.info("Default home page is set to: " +defaultHomePage +" but not state is defined for that page. Redirecting to today.");
                    homeState = 'app.today';
                    break;
            }
            return homeState;
        }
    };

    return startPageService;
});