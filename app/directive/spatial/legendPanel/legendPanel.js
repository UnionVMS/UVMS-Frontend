angular.module('unionvmsWeb').directive('imageOnLoad', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.bind('error', function(){
                scope.$emit('legendError', scope.$parent.$parent.record);
            });
        },
        controller: function($scope){
            var record = $scope.$parent.$parent.record; 
            $scope.$parent.$on('legendError', function(evt, record){
               record.visibility = false;
            });
        }
    };
})
.directive('legendPanel', function(locale, mapService, unitConversionService, $localStorage, $compile, layerPanelService) {
	return {
		restrict: 'EA',
		replace: true,
		scope: false,
		templateUrl: 'directive/spatial/legendPanel/legendPanel.html',
		controller: function(){
		    
		    //For WMS layers
		    this.buildRecWMS = function(layer){
		        var isInternal = layer.get('isInternal'); 
		        var record = {
		            isLabelOnly: false
		        };
                var src = layer.getSource();
                var params  = src.getParams();
                
                var url = src.getUrls()[0];
                if (url.substr(url.length - 1) !== '?'){
                    url += '?';
                }
                url += 'REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=25&HEIGHT=25&LAYER=' + params.LAYERS;
                if (params.STYLES !== '' && angular.isDefined(params.STYLES)){
                    if (params.STYLES.indexOf('label') !== -1 && params.STYLES.indexOf('geom') === -1){
                        url = undefined;
                        record.isLabelOnly = true;
                    } else {
                        url += '&STYLE=' + params.STYLES;
                    }
                }
                
                if (angular.isDefined(url)){
                    url += '&SCALE=' + mapService.getCurrentScale();
                    
                    if (isInternal){
                        this.getLegendWithUsm(url, record);
                        record.isInternal = true;
                    } else {
                        record.src = url;
                        record.isInternal = false;
                    }
                }
                
                record.title = layer.get('title');
                record.type = 'wms';
                record.visibility = layer.get('visible');
                
                return record;
		    };
		    
		    this.getLegendWithUsm = function(url, record){
		        var xhr = new XMLHttpRequest();
		        xhr.open('GET', url, true);
		        xhr.withCredentials = true;
		        xhr.setRequestHeader('Authorization', $localStorage.token);
		        xhr.responseType = 'arraybuffer';
		        xhr.onload = function(){
	                if (typeof window.btoa === 'function'){
	                    if (this.status === 200){
	                        var uInt8Array = new Uint8Array(this.response);
	                        var i = uInt8Array.length;
	                        var binaryString = new Array(i);
	                        while (i--){
	                            binaryString[i] = String.fromCharCode(uInt8Array[i]);
	                        }
	                        var data = binaryString.join('');
	                        var type = xhr.getResponseHeader('content-type');
	                        if (type.indexOf('image') === 0) {
	                            record.src = 'data:' + type + ';base64,' + window.btoa(data);
	                        }
	                    }
	                }
	            };
	            xhr.send();
		    };
		    
		    //VMS positions
		    this.buildRecVmsPos = function(layer){
		        var record = {
		            title: layer.get('title'),
		            subtitle: this.getSubtitle('positions'),
		            type: 'vmspos',
		            visibility: layer.get('visible'),
		            styles: this.getStyles('positions')
		        };
		        
		        return record;
		    };
		    
		    //VMS segments
		    this.buildRecVmsSeg = function(layer){
		        var record = {
		            title: layer.get('title'),
		            subtitle: this.getSubtitle('segments'),
		            type: 'vmsseg',
		            visibility: layer.get('visible'),
		            styles: this.getStyles('segments')
		        };
		        
		        return record;
		    };
		    
		    //Alarms
		    this.buildRecAlarms = function(layer){
		        var record = {
                    title: layer.get('title'),
                    subtitle: locale.getString('spatial.styles_attr_status'),
                    type: 'alarms',
                    visibility: layer.get('visible'),
                    styles: this.getAlarmStyles()
                };
                
                return record;
		    };
		    
		    this.getSubtitle = function(type){
		        var srcDef = mapService.styles[type];
		        var withSpeed = ['reportedSpeed', 'calculatedSpeed', 'speedOverGround'];
		        var withCourse = ['reportedCourse', 'courseOverGround'];
		        
		        var subTitle = locale.getString('spatial.styles_attr_' + srcDef.attribute);
		        if (_.indexOf(withSpeed, srcDef.attribute) !== -1){
		            var srcUnit = unitConversionService.speed.getUnit();
		            subTitle += ' (' + locale.getString('common.speed_unit_' + srcUnit) + ')';
		        }
		        
		        if (_.indexOf(withCourse, srcDef.attribute) !== -1){
                    subTitle += ' (' + String.fromCharCode(parseInt('00B0', 16)) + ')';
                }
		        
		        if (srcDef.attribute === 'distance'){
		            subTitle += ' (' + unitConversionService.distance.getUnit() + ')';
		        }
		        
		        return subTitle;
		    };
		    
		    //Get styles for alarms
		    this.getAlarmStyles = function(){
		        var srcDef = mapService.styles.alarms;
		        var keys = Object.keys(srcDef);
		        
		        var finalStyles = [];
		        for (var i = 0; i < keys.length; i++){
		            if (keys[i] !== 'size'){
		                finalStyles.push({
		                   title: locale.getString('spatial.legend_panel_alarms_' + keys[i]),
		                   color: {"color": srcDef[keys[i]]}
		                });
		            }
		        }
		        
		        return finalStyles;
		    };
		    
		    //Get styles definition for both positions and segments as type
		    this.getStyles = function(type){
                var styleDef = mapService.styles[type];
                var keys = Object.keys(styleDef.style);
                
                var finalStyles = [];
                var i;
                switch (styleDef.attribute) {
                    case 'activity': //Positions
                    case 'type':
                    case 'segmentCategory': //Segments
                        var defaultObj = {};
                        for (i = 0; i < keys.length; i++){
                            if (_.indexOf(['lineWidth', 'lineStyle'], keys[i]) === -1){
                                var styleObj = {
                                    title: keys[i] === 'default' ? locale.getString('spatial.legend_panel_all_other_values') : keys[i].toUpperCase(),
                                    color: {"color" : styleDef.style[keys[i]]}
                                };
                                if (keys[i] === 'default'){
                                    angular.copy(styleObj, defaultObj);
                                } else {
                                    finalStyles.push(styleObj);
                                }
                            }
                        }
                        //Add default color for all other values
                        if (_.keys(defaultObj).length !== 0){
                            finalStyles.push(defaultObj);
                        }
                        break;
                    case 'countryCode':
                        for (i = 0; i < keys.length; i++){
                            if (styleDef.displayedCodes.indexOf(keys[i]) !== -1){
                                finalStyles.push({
                                    title: keys[i].toUpperCase(),
                                    color: {"color" : styleDef.style[keys[i]]}
                                }); 
                            }
                        }
                        break;
                    case 'reportedCourse': //Positions
                    case 'calculatedSpeed':
                    case 'reportedSpeed':
                    case 'speedOverGround':  //Segments
                    case 'distance':
                    case 'courseOverGround':
                        for (i = 0; i < styleDef.breaks.intervals.length; i++){
                            finalStyles.push({
                                title: styleDef.breaks.intervals[i][0] + ' - ' + styleDef.breaks.intervals[i][1],
                                color: {"color" : styleDef.style[styleDef.breaks.intervals[i][0] + '-' + styleDef.breaks.intervals[i][1]]}
                            });
                        }
                        //Finally, add default color for all other values
                        finalStyles.push({
                            title: locale.getString('spatial.legend_panel_all_other_values'),
                            color: {"color" : styleDef.breaks.defaultColor}
                        });
                        break;
                    default:
                        break;
                }
                
                return finalStyles;
            };
		    
		    this.init = function(){
		        if (!angular.isDefined(mapService.map)){
		            return;
		        }
		        
		        var records = [];
		        var layers = mapService.map.getLayers();
		        
		        layers.forEach(function(layer, idx){
	                if (layer.get('visible')){
	                    if (layer.getSource() instanceof ol.source.TileWMS){
	                        records.push(this.buildRecWMS(layer));  
	                    }
	                    
	                    if (layer.getSource() instanceof ol.source.Vector){
	                        switch (layer.get('type')){
	                            case 'vmspos':
	                                if (layer.getSource().getSource().getFeatures().length !== 0){
	                                    records.push(this.buildRecVmsPos(layer));
	                                }
	                                break;
	                            case 'vmsseg':
	                                if (layer.getSource().getFeatures().length !== 0){
	                                    records.push(this.buildRecVmsSeg(layer));
                                    }
                                    break;
	                            case 'alarms':
	                                if (layer.getSource().getFeatures().length !== 0){
                                        records.push(this.buildRecAlarms(layer));
                                    }
                                    break;
	                            default:
	                                return;
	                        }
	                    }
	                }
	            }, this);
		        
		        if (records.length > 0){
		            records.reverse();
		        }
		        
		        return records; 
		    };
		},
		link: function(scope, element, attrs, ctrl) {
		    if(!scope.initialized){
		        scope.initialized = true;
		        scope.legendRecords = ctrl.init();
	            
				layerPanelService.panelToReload.push(function(){
					scope.legendRecords = ctrl.init();
				});
	            /*scope.$on('reloadLegend', function(){
	                scope.legendRecords = ctrl.init();
	            });*/
		        $compile(element)(scope);
            }
		    
		}
	};
});
