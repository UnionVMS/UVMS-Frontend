angular.module('unionvmsWeb').directive('legendPanel', function(locale, mapService, unitConversionService) {
	return {
		restrict: 'EA',
		replace: true,
		scope: false,
		templateUrl: 'directive/spatial/legendPanel/legendPanel.html',
		controller: function(){
		    //For WMS layers
		    this.buildRecWMS = function(layer){
		        var record = {};
                var src = layer.getSource();
                var params  = src.getParams();
                
                record.url = src.getUrls()[0] + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=25&HEIGHT=25&LAYER=' + params.LAYERS;
                if (params.STYLES !== '' && angular.isDefined(params.STYLES)){
                    record.url += '&STYLE=' + params.STYLES;
                }
                
                record.url += '&SCALE=' + mapService.getCurrentScale();
                record.title = layer.get('title');
                record.type = 'wms';
                record.visibility = layer.get('visible');
                
                return record;
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
		    scope.legendRecords = ctrl.init();
		    
		    scope.$on('reloadLegend', function(){
		        scope.legendRecords = ctrl.init();
		    });
		}
	};
});
