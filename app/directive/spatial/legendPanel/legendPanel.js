angular.module('unionvmsWeb').directive('legendPanel', function(mapService) {
	return {
		restrict: 'EA',
		replace: true,
//		transclude: true,
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
		            styles: this.getPositionsStyles()
		        };
		        
		        return record;
		    };
		    
		    this.getPositionsStyles = function(){
		        var styles = mapService.styles.positions;
		        var keys = Object.keys(styles);
		        
		        var finalStyles = [];
		        for (var i = 0; i < keys.length; i++){
		            finalStyles.push({
		               title: keys[i].toUpperCase(),
		               color: {"color" : styles[keys[i]]}
		            });
		        }
		        return finalStyles;
		    };
		    
		    //VMS segments
		    this.buildRecVmsSeg = function(layer){
		        var record = {
		            title: layer.get('title'),
		            type: 'vmsseg',
		            visibility: layer.get('visible'),
		            styles: this.getSegmentsStyles()
		        };
		        
		        return record;
		    };
		    
		    this.getSegmentsStyles = function(){
		        var styles = mapService.styles.segments;
		        var keys = Object.keys(styles);
		        var breaks = mapService.styles.speedBreaks;
		        
		        var finalStyles = [];
		        for (var i = 0; i < breaks.length - 1; i++){
		            finalStyles.push({
		                title: Math.round(breaks[i]*100)/100 + ' - ' + Math.round(breaks[i+1]*100)/100,
		                color: {"color" : styles[keys[i]]}
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
	                                records.push(this.buildRecVmsPos(layer));
	                                break;
	                            case 'vmsseg':
                                    records.push(this.buildRecVmsSeg(layer));
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
