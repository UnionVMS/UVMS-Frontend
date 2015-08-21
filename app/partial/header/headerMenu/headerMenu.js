    angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $location, locale){

    var setMenu = function(){
        return [
            {
                'title': locale.getString('header.menu_today'),
                'url':'/today'
            },
            {
                'title':locale.getString('header.menu_reporting'),
                'url':'/reporting'
            },
            {
                'title':locale.getString('header.menu_movement'),
                'url':'/movement'
            },
            {
                'title':locale.getString('header.menu_exchange'),
                'url':'/exchange'
            },
            {
                'title':locale.getString('header.menu_polling'),
                'url':'/polling/logs'
            },
            {
                'title':locale.getString('header.menu_communication'),
                'url':'/communication'
            },
            {
                'title':locale.getString('header.menu_assets'),
                'url':'/assets'
            },
            {
                'title':locale.getString('header.menu_alarmconditions'),
                'url':'/alarmconditions'
            },
            {
                'title':locale.getString('header.menu_user'),
                'url':'/user'
            },
            {
                'title':locale.getString('header.menu_admin'),
                'url':'/admin'
            }
        ];
    };

    locale.ready('header').then(function () {
        $scope.menu = setMenu();
    });

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

});