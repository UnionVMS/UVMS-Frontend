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
angular.module('unionvmsWeb').directive('gazetteerSearch', function() {
	return {
		restrict: 'E',
		replace: true,
		controller: 'gazetteerCtrl',
		templateUrl: 'directive/spatial/gazetteerSearch/gazetteerSearch.html',
		link: function(scope, element, attrs, ctrl) {
		    scope.searchResults = [];
		    scope.searchStr = undefined;
		    scope.placeholder = '';
		    scope.mapProj = undefined;
		    scope.isWinVisible = true;
		    
		    if (angular.isDefined(attrs.placeholder)){
		        scope.placeholder =  attrs.placeholder;
		    }
		}
	};
});

angular.module('unionvmsWeb').controller('gazetteerCtrl', ['$scope', '$http', '$q', '$timeout', 'tmhDynamicLocale', 'mapService', function($scope, $http, $q, $timeout, tmhDynamicLocale, mapService){
    
    var getNominatimData = function(newVal){
        var selectedLanguage = tmhDynamicLocale.get();
        var reqPromise = $http({
            method: 'GET',
            url: ' http://nominatim.openstreetmap.org/search',
            params: {
                format: 'json',
                addressdetails: 1,
                limit: 15,
                'accept-language': selectedLanguage, 
                q: newVal
            }
        }).success(function(data, status, header, config){
            $scope.isLoading = false;
            $scope.searchResults = data;
            $scope.isWinVisible = true;
        }).error(function(error){
            $scope.isLoading = false;
        });
    };
    
    $scope.doRequest = function(newVal){
        if (newVal === $scope.searchStr){
            getNominatimData(newVal);
        }
    };
    
    $scope.clearSearch = function(){
        if ($scope.isLoading === false){
            $scope.searchResults = [];
            $scope.searchStr = undefined;
        }
        $scope.isLoading = false;
        
        //Remove features from layer
        var layer = mapService.getLayerByType('nominatim');
        if (angular.isDefined(layer)){
            layer.getSource().clear(true);
        }
    };
    
    $scope.toggleRow = function(item, evt){
        evt.stopPropagation();
        item.expanded = !item.expanded;
    };
    
    $scope.zoomTo = function(item){
        var layer = mapService.getLayerByType('nominatim');
        if (!angular.isDefined(layer)){
            layer = mapService.addNominatimLayer();
        }
        
        if (!angular.isDefined($scope.mapProj)){
            $scope.mapProj = mapService.getMapProjectionCode();
        }
        
        var point = new ol.geom.Point([parseFloat(item.lon), parseFloat(item.lat)]);
        var extent = item.boundingbox;
        var polygon = new ol.geom.Polygon.fromExtent([parseFloat(extent[2]), parseFloat(extent[0]), parseFloat(extent[3]), parseFloat(extent[1])]);
        if ($scope.mapProj !== 'EPSG:4326'){
            point.transform('EPSG:4326', $scope.mapProj);
            polygon.transform('EPSG:4326', $scope.mapProj);
        }
        
        var src = layer.getSource();
        src.clear(true);
        src.addFeature(new ol.Feature({
            geometry: point
        }));
        
        mapService.zoomTo(polygon);
    };
    
    $scope.$watch('searchStr', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== ''){
            $scope.isLoading = true;
            if ($scope.requestTimer){
                $timeout.cancel($scope.requestTimer);
            }
            
            $scope.requestTimer = $timeout(function(){
                $scope.doRequest(newVal);
            }, 2000, true, $scope);
        } else {
            $scope.clearSearch();
        }
    });
    
}]);
