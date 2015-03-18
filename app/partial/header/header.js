angular.module('unionvmsWeb').controller('HeaderCtrl',function($scope, $location){
    var setMenu = function(){
        return [
            {
                'title':'Today',
                'url':'/today'
            },
            {
                'title':'Reporting',
                'url':'/reporting'
            },
            {
                'title':'User',
                'url':'/user'
            },
            {
                'title':'Vessel',
                'url':'/vessel'
            },
            {
                'title':'Alarm Conditions',
                'url':'/alarmconditions'
            },{
                'title':'Communication',
                'url':'/communication'
            },{
                'title':'Configuration',
                'url':'/configuration'
            },{
                'title':'GIS',
                'url':'/gis'
            }
        ];
    };

    $scope.menu = setMenu();

    $scope.isActive = function(viewLocation){
        var active = (viewLocation === $location.path());
        return active;
    };

});
