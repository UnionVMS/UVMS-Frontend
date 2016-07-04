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
.controller('wmspreviewCtrl', ['$scope', '$localStorage', 'locale', function($scope, $localStorage, locale){
    $scope.imgSize = 256;
    $scope.buildWMSRequest = function(){
        var layerDef = $scope.getLayerTypeDef();
        if (angular.isDefined(layerDef)){
            var url = layerDef.url;
            if (url.substr(url.length - 1) !== '?'){
                url += '?';
            }
            
            url += '&request=GetMap&srs=EPSG:4326&Format=image/png&width=' + $scope.imgSize + '&height=' + $scope.imgSize;
            url += '&layers=' + layerDef.layer + '&bbox=';
            url += $scope.getExtent(); 
            
            
            url += '&styles='; 
            if (angular.isDefined(layerDef.includeStyle) && layerDef.includeStyle === true){
                url += layerDef.style;
            }
            
            //Build cql filter
            if (angular.isDefined(layerDef.cqlProperty)){
                var cql = "&cql_filter=" + layerDef.cqlProperty + " = ";
                if (layerDef.propertyType === 'string'){
                    cql += "'" + $scope.record[layerDef.cqlProperty] + "'";
                } else {
                    cql +=  $scope.record[layerDef.cqlProperty];
                }
                
                url += cql;
            }
            
            return url;
        }
    };
    
    $scope.getExtent = function(){
        var extent = '-180,-90,180,90';
        
        if (angular.isDefined($scope.record.extent)){
            var wkt = new ol.format.WKT();
            var geom = wkt.readGeometry($scope.record.extent);
            
            if ($scope.record.extent.indexOf('POINT') !== -1){
                geom = ol.extent.buffer(geom.getExtent(), 3);
                extent = geom.toString();
            } else {
                extent = geom.getExtent().toString();
            }
            
            
        }
        
        return extent;
    };
    
    $scope.getWMSImgWithUsm = function(url, api){
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
                        $scope.imgSrc = 'data:' + type + ';base64,' + window.btoa(data);
                        api.set('content.text', '<img src="' + $scope.imgSrc + '"/>');
                    }
                }
            }
        };
        xhr.send();
    };
    
    $scope.click = function(){
        var imgURL = $scope.buildWMSRequest();
        if (angular.isDefined(imgURL)){
            $scope.createTip(imgURL);
        }
    };
    
    $scope.createTip = function(imgURL){
        $scope.tip = $scope.el.qtip({
            content: {
                text: function(evt, api){
                    $scope.getWMSImgWithUsm(imgURL, api);
                    var html = '<i class="fa fa-spinner fa-spin"></i>&nbsp;';
                    html += '<span>' + locale.getString('spatial.loading_data') + '</span>'; 
                    return html;
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
                    delete $scope.tip;
                    delete $scope.imgSrc;
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
