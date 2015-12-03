angular.module('unionvmsWeb').directive('legendPanel', function(locale, mapService) {
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
                
                //TODO add layer name from layer definition
                record.url = src.getUrls()[0] + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=25&HEIGHT=25&LAYER=' + params.LAYERS;
                if (params.STYLES !== ''){
                    record.url += '&STYLE=' + params.STYLES;
                }
                record.title = layer.get('title');
                record.type = 'wms';
                record.visibility = layer.get('visible');
                
                return record;
		    };
		    
		    //VMS positions
		    this.buildRecVmsPos = function(layer){
		        var record = {
		            title: layer.get('title'),
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
		            type: 'vmsseg',
		            visibility: layer.get('visible'),
		            styles: this.getStyles('segments')
		        };
		        
		        return record;
		    };
		    
		    //Get styles definition for both positions and segments as type
		    this.getStyles = function(type){
                var styleDef = mapService.styles[type];
                var keys = Object.keys(styleDef.style);
                
                var finalStyles = [];
                var i;
                if (styleDef.attribute === 'countryCode'){
                    for (i = 0; i < keys.length; i++){
                        if (styleDef.displayedCodes.indexOf(keys[i]) !== -1){
                          finalStyles.push({
                             title: keys[i].toUpperCase(),
                             color: {"color" : styleDef.style[keys[i]]}
                          }); 
                      }
                    }
                } else {
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
	                                if (layer.getSource().getFeatures().length !== 0){
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
