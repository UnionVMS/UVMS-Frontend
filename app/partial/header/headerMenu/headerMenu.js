    angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $rootScope, $location, userService, locale){

    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature,module,true);
    };

    $scope.menu = [];

    var addMenuItem = function(text, url){
        $scope.menu.push({
            'title':text,
            'url':url
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
        //addMenuItem(locale.getString('header.menu_today'), '/today');

        //REPORTING
        addMenuItem(locale.getString('header.menu_reporting'), '/reporting');

        //MOVEMENT
        var movementLink = false;
        if(checkAccess('Movement', 'viewMovements')){
            movementLink = '/movement';
        }else if(checkAccess('Movement', 'viewManualMovements')){
            movementLink = '/movement/manual';
        }
        if(movementLink){
            addMenuItem(locale.getString('header.menu_movement'), movementLink);
        }

        //EXCHANGE
        if(checkAccess('Exchange', 'viewExchange')){
            addMenuItem(locale.getString('header.menu_exchange'), '/exchange');
        }

        //POLLING
        if(checkAccess(unionVMSApplication, 'viewMobileTerminalPolls')){
            addMenuItem(locale.getString('header.menu_polling'), '/polling/logs');
        }
        //COMMUNICATION, ASSETS
        if(checkAccess(unionVMSApplication, 'viewVesselsAndMobileTerminals')){
            addMenuItem(locale.getString('header.menu_communication'), '/communication');
            addMenuItem(locale.getString('header.menu_assets'), '/assets');
        }

        //ALARMS
        var alarmsLink = false;
        if(checkAccess('Rules', 'viewAlarmsHoldingTable')){
            alarmsLink = '/alarms/holdingtable';
        }else if(checkAccess('Rules', 'viewAlarmsOpenTickets')){
            alarmsLink = '/alarms/notifications';
        }else if(checkAccess('Rules', 'viewAlarmsRules')){
            alarmsLink = '/alarms/rules';
        }
        if(alarmsLink){
            addMenuItem(locale.getString('header.menu_alarmconditions'), alarmsLink);
        }

        //USERS
        if(accessToAnyFeatureInList('USM', userFeatures)){
            addMenuItem(locale.getString('header.menu_user'), '/usm/users');
        }

        //ADMIN
        var adminLink = false;
        if(checkAccess('Audit', 'viewAudit')){
            adminLink = '/admin/auditlog';
        }else if(checkAccess('Configuration', 'viewConfiguration')){
            adminLink = '/admin/configuration';
        }
        if(adminLink){
            addMenuItem(locale.getString('header.menu_admin'), adminLink);
        }
    };

    var init = function(){
        setMenu();
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
    });

    init();

});