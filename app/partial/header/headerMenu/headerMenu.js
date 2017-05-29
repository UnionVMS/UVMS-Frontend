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
angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $rootScope, $location, $state, $timeout, userService, userFeatureAccess, startPageService, locale){

    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature, module, true);
    };

    var addMenuItem = function(text, url, elemId) {
        $scope.menu.push(
            {
                'title': text,
                'url': url,
                'elemId': elemId
            }
        );
    };

    var setMenu = function() {

        $scope.menu = [];

        // Today
        addMenuItem(locale.getString('header.menu_today'), '/today', 'today');

        // Reports
        if (checkAccess('Reporting', 'LIST_REPORTS')) {
            addMenuItem(locale.getString('header.menu_reporting'), '/reporting', 'reporting');
        }

        // Area management
        if (checkAccess('Spatial', 'VIEW_AREA_MANAGEMENT_UI') && (checkAccess('Spatial', 'MANAGE_USER_DEFINED_AREAS') || checkAccess('Spatial', 'MANAGE_REFERENCE_DATA') || checkAccess('Spatial', 'MANAGE_ANY_USER_AREA'))) {
            addMenuItem(locale.getString('header.menu_areas'), '/areas', 'areas');
        }

        // Activity
        if (checkAccess('Activity', 'ACTIVITY_ALLOWED')) {
            addMenuItem(locale.getString('header.menu_activity'), '/activity', 'activity');
        }

        // Positions
        var movementLink = false;
        var movementElemId;

        if (checkAccess('Movement', 'viewMovements')) {
            movementLink = '/movement';
            movementElemId = 'movement';
        } else if (checkAccess('Movement', 'viewManualMovements')) {
            movementLink = '/movement/manual';
            movementElemId = 'manual-movement';
        }

        if (movementLink) {
            addMenuItem(locale.getString('header.menu_movement'), movementLink, movementElemId);
        }

        // Exchange
        if (checkAccess('Exchange', 'viewExchange')) {
            addMenuItem(locale.getString('header.menu_exchange'), '/exchange', 'exchange');
        }

        // Polling
        if (checkAccess('Union-VMS', 'viewMobileTerminalPolls')) {
            addMenuItem(locale.getString('header.menu_polling'), '/polling/logs', 'polling-logs');
        }

        // Assets
        if (checkAccess('Union-VMS', 'viewVesselsAndMobileTerminals')) {
            addMenuItem(locale.getString('header.menu_assets'), '/assets', 'assets');
        }

        // Mobile Terminals
        if (checkAccess('Union-VMS', 'viewVesselsAndMobileTerminals')) {
            addMenuItem(locale.getString('header.menu_communication'), '/communication', 'communication');
        }

        // Alerts
        var alarmsLink = false;
        var alarmsElemId;

        if (checkAccess('Rules', 'viewAlarmsHoldingTable')) {
            alarmsLink = '/alerts/holdingtable';
            alarmsElemId = 'holding-table';
        } else if (checkAccess('Rules', 'viewAlarmsOpenTickets')) {
            alarmsLink = '/alerts/notifications';
            alarmsElemId = 'alarms-notifications';
        } else if (checkAccess('Rules', 'viewAlarmRules')) {
            alarmsLink = '/alerts/rules';
            alarmsElemId = 'alarms-rules';
        }

        if (alarmsLink) {
            addMenuItem(locale.getString('header.menu_alarmconditions'), alarmsLink, alarmsElemId);
        }

        // User
        if (userFeatureAccess.accessToAnyFeatureInList('USM')) {
            addMenuItem(locale.getString('header.menu_user'), '/usm/users', 'users');
        }

        // Admin
        var adminLink = false;
        var adminElemId;

        if (checkAccess('Audit', 'viewAudit')) {
            adminLink = '/admin/auditlog';
            adminElemId = 'audit-log';
        } else if (checkAccess('Configuration', 'viewConfiguration')) {
            adminLink = '/admin/configuration';
            adminElemId = 'admin-configuration';
        }

        if (adminLink) {
            addMenuItem(locale.getString('header.menu_admin'), adminLink, adminElemId);
        }
    };

    var getFirstPathSegment = function(path) {
        if (!path) {
            return "";
        }

        var absolutePath = path.substr(0,1) === "/";
        var pathComponents = (absolutePath ? path.substr(1, path.length - 1) : path).split("/");
        return absolutePath ? "/" + pathComponents[0] : pathComponents[0];
    };

    $scope.isActive = function(viewLocation){
        return getFirstPathSegment($location.path()) === (getFirstPathSegment(viewLocation));
    };

    $rootScope.$on('AuthenticationSuccess', function () {
        setMenu();
    });

    $rootScope.$on('needsAuthentication', function () {
        setMenu();
    });

    $rootScope.$on('ContextSwitch', function () {
        setMenu();
        var homeState = startPageService.getStartPageStateName();

        console.log($state.current.name);
        console.log(homeState);

        if ($state.current.name === homeState) {
        	//This timeout is required when the homeState is the same as the current tab
        	$timeout(function() {
        		$state.go(homeState, {});
    		}, 1);
        } else {
        	$state.go(homeState, {});
        }

    });

    setMenu();

});
