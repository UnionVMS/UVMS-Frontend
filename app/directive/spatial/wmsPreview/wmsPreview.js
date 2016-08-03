angular.module('unionvmsWeb').directive('wmsPreview', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    record: '=',
		    getLayerTypeDef: '&'
		},
		templateUrl: 'directive/spatial/wmsPreview/wmsPreview.html',
		controller: 'wmspreviewCtrl',
		link: function(scope, element, attrs, fn) {
		    scope.el = element;
		}
	};
})
.controller('wmspreviewCtrl', ['$scope', '$localStorage', 'locale', 'genericMapService', function($scope, $localStorage, locale, genericMapService){
    $scope.click = function(){
        $scope.createTip();
    };
    
    $scope.createMap = function(){
        var wmsLayer = $scope.buildWMSLayer();
        $scope.map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            controls: [],
            target: 'wmspreview-tooltip',
            view: new ol.View({
                center: [0,0],
                zoom: 2
            })
        });
        
        if (angular.isDefined(wmsLayer)){
            $scope.map.addLayer(wmsLayer);
        }
        
        var extent = $scope.calculateExtent();
        if (angular.isDefined(extent)){
            $scope.map.getView().fit(extent, $scope.map.getSize(), true);
        }
    };
    
    $scope.calculateExtent = function(){
        var extent, geom;
        if (angular.isDefined($scope.record.extent)){
            var wkt = new ol.format.WKT();
            geom = wkt.readGeometry($scope.record.extent);
            geom = genericMapService.intersectGeomWithProj(geom, $scope.map);
            
            if ($scope.record.extent.indexOf('POINT') !== -1){
                extent = ol.extent.buffer(geom.getExtent(), 5000);
            } else {
                extent = geom.getExtent();
            }
        } else {
            geom = ol.geom.Polygon.fromExtent([-20026376.39,-20048966.10,20026376.39,20048966.10]);
            extent = geom.getExtent();
        }
        
        return ol.geom.Polygon.fromExtent(extent);
    };
    
    $scope.buildWMSLayer = function(){
        var layerDef = $scope.getLayerTypeDef();
        if (angular.isDefined(layerDef)){
            var url = layerDef.url;
            
            var params = {
                LAYERS: layerDef.layer,
                TILED: true
            };
            
            if (angular.isDefined(layerDef.includeStyle) && layerDef.includeStyle === true){
                params.STYLES = layerDef.style;
            }
            
            //Build cql filter
            if (angular.isDefined(layerDef.cqlProperty)){
                var cql = layerDef.cqlProperty + " = ";
                if (layerDef.propertyType === 'string'){
                    cql += "'" + $scope.record[layerDef.cqlProperty] + "'";
                } else {
                    cql +=  $scope.record[layerDef.cqlProperty];
                }
                
                params.cql_filter = cql;
            }
            
            var config = {
                title: 'wmslayer',
                serverType: 'geoserver',
                url: url,
                params: params
            };
            
            var layer = genericMapService.defineWms(config);
            return layer;
        }
    };
    
    $scope.createTip = function(){
        $scope.tip = $scope.el.qtip({
            content: {
                text: function(evt, api){
                    return '<div id="wmspreview-tooltip"></div>';
                }
            },
            position: {
                my: 'left center',
                at: 'right center',
                target: $scope.el,
                effect: false
            },
            show: {
                when: false,
                effect: false
            },
            events: {
                hide: function(event, api) {
                    api.destroy(true); // Destroy it immediately
                    $scope.map.setTarget(null);
                    delete $scope.map;
                    delete $scope.tip;
                },
                visible: function(event,api){
                    $scope.createMap();
                }
            },
            style: {
                classes: 'qtip-bootstrap'
            }
        });
    
        var api = $scope.tip.qtip('api');
        api.show();
    };
}]);
