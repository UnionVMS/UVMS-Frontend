    angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $location, locale){

    var setMenu = function(){
        return [
            {
                'title': locale.getString('header.menu_today'),
                'url':'/today'
            },
            {
                'title':locale.getString('header.menu_movement'),
                'url':'/movement'
            },
            {
                'title':locale.getString('header.menu_reporting'),
                'url':'/reporting'
            },
            {
                'title':locale.getString('header.menu_user'),
                'url':'/user'
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
                'title':locale.getString('header.menu_communication'),
                'url':'/communication'
            },
            {
                'title':locale.getString('header.menu_audit'),
                'url':'/audit/auditlog'
            },
            {
                'title':locale.getString('header.menu_configuration'),
                'url':'/configuration'
            },
            {
                'title':locale.getString('header.menu_gis'),
                'url':'/gis'
            }
        ];
    };
    
    
    locale.ready('header').then(function () {
        $scope.menu = setMenu();
    });    

    $scope.isActive = function(viewLocation){
        var active = ($location.path().indexOf(viewLocation) >= 0);
        return active;
    };

});