angular.module('unionvmsWeb').controller('MapCtrl',function($scope, locale, mapService, spatialHelperService){
    $scope.activeControl = '';
    $scope.showMeasureConfigWin = false;
    $scope.measureConfigs = spatialHelperService.measure;
    $scope.tbControls = spatialHelperService.tbControls;
    
    //Close identify popup
    $scope.closePopup = function(){
        mapService.closePopup();
    };
    
    $scope.measuringUnits = [];
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_meters'), "code": "m"});
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_nautical_miles'), "code": "nm"});
    $scope.measuringUnits.push({"text": locale.getString('spatial.map_measuring_units_miles'), "code": "mi"});
    
    //Handle toggle on top toolbar
    $scope.toggleToolbarBtn = function(tool){
        var fn;
        var previousControl = $scope.activeControl;
        
        if (tool !== previousControl && previousControl !== ''){
            fn = previousControl + 'Disable';
            $scope.activeControl = tool;
            $scope[fn]();
        } else if (tool === previousControl){
            fn = previousControl + 'Disable';
            $scope.activeControl = '';
            $scope[fn]();
        } else {
            $scope.activeControl = tool;
        }
        
        if ($scope.activeControl !== ''){
            fn = $scope.activeControl + 'Enable';
            $scope[fn]();
        }
    };
    
    //Measure control
    $scope.measureEnable = function(){
        $scope.openMeasureConfigWin();
        mapService.startMeasureControl();
    };
    
    $scope.openMeasureConfigWin = function(){
        $scope.showMeasureConfigWin = true;
        var win = angular.element('#measure-config');
        if (win.draggable('instance') === undefined){
            win.draggable({
                handle: 'span',
                containment: '.map-container',
                scroll: false 
            });
        }
        var mapEl = mapService.map.getTargetElement();
        var mapRect = mapEl.getBoundingClientRect();
        win[0].style.marginTop = '8px';
        win[0].style.top = 'auto';
        win[0].style.left = mapRect.left + 40 + 'px';
    };
    
    $scope.measureDisable = function(){
        $scope.showMeasureConfigWin = false;
        mapService.clearMeasureControl();
        $scope.measureConfigs.units = 'm';
        $scope.measureConfigs.speed = undefined;
        $scope.measureConfigs.startDate = undefined;
    };
    
    $scope.clearMapHighlights = function(){
        var layer = mapService.getLayerByType('highlight');
        layer.getSource().clear(true);
    };
    
    //Untoggle any toolbar btn when tab is changed
    $scope.$on('untoggleToolbarBtns', function(evt){
        if ($scope.activeControl !== ''){
            $scope.toggleToolbarBtn($scope.activeControl);
        }
    });
    
    //Other controls
//    $scope.otherEnable = function(){
//        console.log('enable other');
//    };
//    
//    $scope.otherDisable = function(){
//        console.log('disable other');
//    };
});

angular.module('unionvmsWeb').controller('MappanelCtrl',function($scope, locale, mapService, spatialHelperService){
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
            }],
            tbControls: [{
                type: 'measure'
            }]
        }
    };
    
    locale.ready('spatial').then(function(){
        mapService.setMap($scope.config);
        $scope.map = mapService.map;
        spatialHelperService.setToolbarControls($scope.config);
    });
});