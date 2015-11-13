angular.module('unionvmsWeb').controller('MapCtrl',function($scope, locale, mapService, spatialHelperService, $window){
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
    
    var resizeMap = function(evt) {
    	
        var w = angular.element(window);
        var map = $('#map')[0];
        
        if(evt && (angular.element('.mapPanelContainer.fullscreen').length > 0 ||
        		(angular.element('.mapPanelContainer.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){
        	
        	setTimeout(function() {
        		$('.map-container').css('height', w.height() - 30 + 'px');
        		$('[ng-controller="LayerpanelCtrl"]').css('height', w.height() - 30 + 'px');
                $('#map').css('height', w.height() - 62 + 'px');
                mapService.updateMapSize();
        	}, 200);
      	  return;
        }
        
        setTimeout(function() {
	        var offset = 100;
	        var minHeight = 340;
	        var footerHeight = angular.element('footer')[0].offsetHeight;
	        var headerHeight = angular.element('header')[0].offsetHeight;
	        var newHeight = w.height() - headerHeight - footerHeight - offset;
	        
	        if (newHeight < minHeight) {
	            newHeight = minHeight;
	        }
	        
	        $('.map-container').css('height', newHeight);
	        $('[ng-controller="LayerpanelCtrl"]').css('height', newHeight);
	        $('#map').css('height', newHeight - 32 + 'px');
	        
	        mapService.updateMapSize();
        }, 200);
  	};
    
    $(window).resize(resizeMap);
    $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', resizeMap);
    
    angular.element(document).ready(function () {
    	resizeMap();
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
            },{
                type: 'scale',
                units: 'nautical' //Possible values: metric, degrees, nautical, us, imperial
            },{
                type: 'mousecoords',
                epsgCode: 4326,
                format: 'dd' //Possible values: dd, dms, ddm, m
            },{
                type: 'history'
            }],
            tbControls: [{
                type: 'measure'
            },{
                type: 'fullscreen'
            }]
        }
    };
    
    locale.ready('spatial').then(function(){
        mapService.setMap($scope.config);
        $scope.map = mapService.map;
        spatialHelperService.setToolbarControls($scope.config);
    });
});