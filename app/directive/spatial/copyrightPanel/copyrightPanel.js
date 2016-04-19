angular.module('unionvmsWeb').directive('copyrightPanel', function(mapService) {
	return {
		restrict: 'EA',
		replace: true,
		scope: false,
		templateUrl: 'directive/spatial/copyrightPanel/copyrightPanel.html',
		controller: function(){
		    this.init = function(){
		        if (!angular.isDefined(mapService.map)){
		            return;
		        }
		        
                var records = [];
                var layers = mapService.map.getLayers();
                
                layers.forEach(function(layer, idx){
                    var attribution = layer.get('longAttribution');
                    if (layer.get('visible') && angular.isDefined(attribution) && attribution !== ''){
                        records.push({
                            title: layer.get('title'),
                            copyright: layer.get('longAttribution')
                        });
                    }
                }, this);
                
                if (records.length > 0){
                    records.reverse();
                }
                
                return records; 
            };
		},
    	link: function(scope, element, attrs, ctrl) {
            scope.records = ctrl.init();
            
            scope.$on('reloadLegend', function(){
                scope.records = ctrl.init();
            });
        }
	};
});