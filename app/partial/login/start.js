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
//Start controller
angular.module('unionvmsWeb').controller('StartCtrl', function($scope, $log, $state, startPageService) {
    //Get the start state from the global settings and redirect to that state
    var homeState = startPageService.getStartPageStateName();
    $state.go(homeState, {}, {location: 'replace'});
});

angular.module('unionvmsWeb').factory('startPageService',function($log, globalSettingsService, userService, userFeatureAccess) {

    var unionVMSApplication = 'Union-VMS';
    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature,module,true);
    };

    //Matches pages (in global config) with states in the app
    //Order of pages and states are of importance only when user don't have access to the homepage set in the global config
    var pagesAndStates = {
        today : ['app.today'],
        exchange : ['app.exchange'],
        positions : ['app.movement'],
        polling : ['app.pollingLogs'],
        mobileTerminals : ['app.communication'],
        assets : ['app.assets'],
        alarms : ['app.holdingTable', 'app.openTickets'],
        admin : ['app.auditLog'],
        user : ['app.usm.users'],
        subscription : ['app.manageSubscriptions'],
        reporting : ['app.reporting'],
        areaManagement: ['app.areas'],
        activity: ['app.activity'],
        realtime: ['app.realtime']
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
                return checkAccess('Rules', 'viewAlarmsHoldingTable');
            case 'app.openTickets':
                return checkAccess('Rules', 'viewAlarmsOpenTickets');
            case 'app.auditLog':
                return checkAccess('Audit', 'viewAudit');
            case 'app.usm.users':
                return userFeatureAccess.accessToAnyFeatureInList('USM');
            case 'app.reporting':
                return checkAccess('Reporting', 'LIST_REPORTS');
            case 'app.manageSubscriptions':
                return checkAccess('Subscription','VIEW_SUBSCRIPTION');
            case 'app.areas':
                return checkAccess('Spatial', 'VIEW_AREA_MANAGEMENT_UI');
            case 'app.today':
                return true;
            case 'app.activity':
                return checkAccess('Activity', 'ACTIVITY_ALLOWED');
            case 'app.realtime':
                return checkAccess('Realtime', 'REALTIME_ALLOWED');
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
