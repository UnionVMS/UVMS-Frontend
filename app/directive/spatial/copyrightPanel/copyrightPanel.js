angular.module('unionvmsWeb').directive('copyrightPanel', function(mapService, layerPanelService, locale) {
	return {
		restrict: 'EA',
		replace: true,
		scope: false,
		templateUrl: 'directive/spatial/copyrightPanel/copyrightPanel.html',
		controller: function($scope){
		    $scope.createTip = function(record){
		        var target = angular.element('.disclaimer' + record.idx);
		        var tip;
		        if (angular.isDefined($(target).attr('data-hasqtip'))){
		            tip = $(target);
		        } else {
		            tip = target.qtip({
	                    content: {
	                        text: function(evt, api){
	                            return record.disclaimer;
	                        }
	                    },
	                    position: {
	                        my: 'left center',
	                        at: 'right center',
	                        target: target,
	                        effect: false
	                    },
	                    show: {
	                        solo: true,
	                        when: false,
	                        effect: false
	                    },
	                    style: {
	                        classes: 'qtip-bootstrap disclaimer-tip'
	                    }
	                });
		        }
		        
		        var api = tip.qtip('api');
		        api.show();
		    };
		    
		    $scope.setIdx = function(idx){
		        $scope.records[idx].idx = idx;
		    };
		    
		    this.init = function(){
		        if (!angular.isDefined(mapService.map)){
		            return;
		        }
		        
                var records = [];
                var layers = mapService.map.getLayers();
                
                layers.forEach(function(layer, idx){
                    var attribution = layer.get('longAttribution');
                    if (layer.get('visible') && angular.isDefined(attribution) && attribution !== ''){
                        if (attribution.indexOf('div') !== -1){
                            //Support html content
                            
                            var record = {
                                title: layer.get('title'),
                                copyright: $(attribution).find('.copy-message').prop('outerHTML')
                            }; 
                            
                            var disclaimerHtml = $(attribution).find('.copy-disclaimer');
                            if (disclaimerHtml.length > 0){
                                record.disclaimer = disclaimerHtml.prop('outerHTML');
                            }
                            records.push(record);
                        } else {
                            //Support normal text content
                            records.push({
                                title: layer.get('title'),
                                copyright: attribution
                            });
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
            scope.records = ctrl.init();
            
            layerPanelService.panelToReload.push(function(){
                scope.records = ctrl.init();
            });
        }
	};
});