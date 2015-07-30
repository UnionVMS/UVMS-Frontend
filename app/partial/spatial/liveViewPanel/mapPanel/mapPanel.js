angular.module('unionvmsWeb').controller('MappanelCtrl',function($scope, locale, mapService){
    //Mock config object
    $scope.config = {
        map: {
            projection: {
                epsgCode: 3857, //So far we only support 3857 and 4326
                units: 'm',
                global: true
            },
            controls: [{
                type: 'zoom'
            },{
                type: 'drag'
            }, {
                type: 'scale',
                units: 'nautical' //Possible values: metric, degrees, nautical, us, imperial
            }, {
                type: 'fullscreen'
            },{
                type: 'mousecoords',
                epsgCode: 4326,
                format: 'dd' //Possible values: dd, dms, ddm, m
            },{
                type: 'history'
            }]
        }
    }; 
        
    locale.ready('spatial').then(function(){
        mapService.setMap($scope.config);
        $scope.map = mapService.map;
    });
});