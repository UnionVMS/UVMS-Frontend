/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
