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
        if(checkAccess('Movement', 'movementConfig')){
            addMenuItem(locale.getString('header.menu_movement'), '/movement');
        }

        //EXCHANGE
        if(checkAccess('Exchange', 'viewExchangeLog')){
            addMenuItem(locale.getString('header.menu_exchange'), '/exchange');
        }

        //POLLING
        if(checkAccess('Union-VMS', 'viewMobileTerminalPolls')){
            addMenuItem(locale.getString('header.menu_polling'), '/polling/logs');        
        }
        //COMMUNICATION, ASSETS
        if(checkAccess('Union-VMS', 'viewVesselsAndMobileTerminals')){
            addMenuItem(locale.getString('header.menu_communication'), '/communication');
            addMenuItem(locale.getString('header.menu_assets'), '/assets');            
        }

        //ALARMS
        addMenuItem(locale.getString('header.menu_alarmconditions'), '/alarms/holdingtable');
        
        //USERS
        if(checkAccess('USM', 'viewUsers')){
            addMenuItem(locale.getString('header.menu_user'), '/usm');
        }

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