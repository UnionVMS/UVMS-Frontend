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
		    
		    this.init = function(){
		        var records = [];
		        var layers = mapService.map.getLayers();
		        
		        layers.forEach(function(layer){
	                if (layer.get('visible')){
	                    if (layer.getSource() instanceof ol.source.TileWMS){
	                        records.push(this.buildRecWMS(layer));  
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
