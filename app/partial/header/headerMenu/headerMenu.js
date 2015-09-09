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

    var setMenu = function(){
        $scope.menu = [];

        //TODAY
        addMenuItem(locale.getString('header.menu_today'), '/today');

        //REPORTING
        addMenuItem(locale.getString('header.menu_reporting'), '/reporting');

        //MOVEMENT
        addMenuItem(locale.getString('header.menu_movement'), '/movement');

        //EXCHANGE
        addMenuItem(locale.getString('header.menu_exchange'), '/exchange');

        //POLLING
        addMenuItem(locale.getString('header.menu_polling'), '/polling/logs');

        //COMMUNICATION
        if(checkAccess('MobileTerminal', 'mobileTerminalConfig')){
            addMenuItem(locale.getString('header.menu_communication'), '/communication');
        }

        //ASSETS
        if(checkAccess('Vessel', 'vesselConfig')){
            addMenuItem(locale.getString('header.menu_assets'), '/assets');            
        }

        //ALARMS
        addMenuItem(locale.getString('header.menu_alarmconditions'), '/alarms/holdingtable');
        
        //USM
        //if(checkAccess('USM', 'viewUsers')){
            addMenuItem(locale.getString('header.menu_user'), '/usm');
        //}

        //ADMIN
        addMenuItem(locale.getString('header.menu_admin'), '/admin');
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