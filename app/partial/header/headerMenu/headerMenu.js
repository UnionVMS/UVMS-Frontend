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
angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $rootScope, $location, $state, $timeout, userService, startPageService, locale){

    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature,module,true);
    };

    $scope.menu = [];

    var addMenuItem = function(text, url, elemId){
        $scope.menu.push({
            'title':text,
            'url':url,
            'elemId':elemId
        });
    };

    //Features for showing user in menu
    var userFeatures = [
        'activateRoles',
        'activateScopes',
        'activateUsers',
        'assignRoles',
        'assignScopes',
        'configurePolicies',
        'copyUserProfile',
        'manageApplications',
        'manageEndpoints',
        'manageOrganisations',
        'managePersons',
        'manageRoles',
        'manageScopes',
        'manageUserContexts',
        'manageUserPreferences',
        'manageUsers',
        'viewApplications',
        'viewEndpointsDetails',
        'viewOrganisationDetails',
        'viewOrganisations',
        'viewPersonDetails',
        'viewRoles',
        'viewScopes',
        'viewUserContexts',
        'viewUserPreferences',
        'viewUsers',
    ];

    var accessToAnyFeatureInList = function(application, featureList){
        var access = false;
        $.each(featureList, function(index, feature){
            if(checkAccess(application, feature)){
                access = true;
                return false;
            }
        });
        return access;
    };

    var setMenu = function(){
        $scope.menu = [];

        var unionVMSApplication = 'Union-VMS';

        //TODAY
        addMenuItem(locale.getString('header.menu_today'), '/today', 'today');

        //REPORTING
        if(checkAccess('Reporting', 'LIST_REPORTS')){
            addMenuItem(locale.getString('header.menu_reporting'), '/reporting', 'reporting');
        }

        //AREAS
        if(checkAccess('Spatial', 'VIEW_AREA_MANAGEMENT_UI') && (checkAccess('Spatial', 'MANAGE_USER_DEFINED_AREAS') || checkAccess('Spatial', 'MANAGE_REFERENCE_DATA') || checkAccess('Spatial', 'MANAGE_ANY_USER_AREA'))){
            addMenuItem(locale.getString('header.menu_areas'), '/areas', 'areas');
        }
        //ACTIVITY
        if(checkAccess('Activity', 'ACTIVITY_ALLOWED')){
            addMenuItem(locale.getString('header.menu_activity'), '/activity', 'activity');
        }

        //MOVEMENT
        var movementLink = false;
        var movementElemId;
        if(checkAccess('Movement', 'viewMovements')){
            movementLink = '/movement';
            movementElemId = 'movement';
        }else if(checkAccess('Movement', 'viewManualMovements')){
            movementLink = '/movement/manual';
            movementElemId = 'manual-movement';
        }
        if(movementLink){
            addMenuItem(locale.getString('header.menu_movement'), movementLink, movementElemId);
        }

        //SALES
        if (checkAccess('Sales', 'getSalesNotes')) {
            addMenuItem(locale.getString('header.menu_sales'), '/sales', 'sales');
        }

        //EXCHANGE
        if(checkAccess('Exchange', 'viewExchange')){
            addMenuItem(locale.getString('header.menu_exchange'), '/exchange', 'exchange');
        }

        //POLLING
        if(checkAccess(unionVMSApplication, 'viewMobileTerminalPolls')){
            addMenuItem(locale.getString('header.menu_polling'), '/polling/logs', 'polling-logs');
        }
        //COMMUNICATION, ASSETS
        if(checkAccess(unionVMSApplication, 'viewVesselsAndMobileTerminals')){
            addMenuItem(locale.getString('header.menu_communication'), '/communication', 'communication');
            addMenuItem(locale.getString('header.menu_assets'), '/assets', 'assets');
        }

        //ALARMS
        var alarmsLink = false;
        var alarmsElemId;
        if(checkAccess('Rules', 'viewAlarmsHoldingTable')){
            alarmsLink = '/alerts/holdingtable';
            alarmsElemId = 'holding-table';
        }else if(checkAccess('Rules', 'viewAlarmsOpenTickets')){
            alarmsLink = '/alerts/notifications';
            alarmsElemId = 'alarms-notifications';
        }else if(checkAccess('Rules', 'viewAlarmRules')){
            alarmsLink = '/alerts/rules';
            alarmsElemId = 'alarms-rules';
        }
        if(alarmsLink){
            addMenuItem(locale.getString('header.menu_alarmconditions'), alarmsLink, alarmsElemId);
        }

        //USERS
        if(accessToAnyFeatureInList('USM', userFeatures)){
            addMenuItem(locale.getString('header.menu_user'), '/usm/users', 'users');
        }

        //ADMIN
        var adminLink = false;
        var adminElemId;
        if(checkAccess('Audit', 'viewAudit')){
            adminLink = '/admin/auditlog';
            adminElemId = 'audit-log';
        }else if(checkAccess('Configuration', 'viewConfiguration')){
            adminLink = '/admin/configuration';
            adminElemId = 'admin-configuration';
        }
        if(adminLink){
            addMenuItem(locale.getString('header.menu_admin'), adminLink, adminElemId);
        }
    };

    var init = function(){
    	if($state.current.name !== 'app.reporting-id'){
    		setMenu();
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

    locale.ready('header').then(function () {
        init();
    });

    $rootScope.$on('AuthenticationSuccess', function () {
        init();
    });
    $rootScope.$on('needsAuthentication', function () {
        init();
    });
    $rootScope.$on('ContextSwitch', function () {
        init();
        var homeState = startPageService.getStartPageStateName();
        if($state.current.name === homeState){
        	//This timeout is required when the homeState is the sane as the current tab
        	$timeout(function() {
        		$state.go(homeState, {});
    		},1);
        }else{
        	$state.go(homeState, {});
        }

    });

    init();

});
