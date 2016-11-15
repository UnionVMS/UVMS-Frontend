/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name locationTile
 * @attr {String} fieldTitle - The title of the fieldset tile
 * @attr {Object} locationDetails - An object containing the data to be used witin the tile (e.g. location name and geometry)
 * @attr {Boolean} isClickable - Whether the tile should be clickable or not so that we can zoom to the location in the main map controlled by the mapService ({@link unionvmsWeb.mapService})
 * @attr {Function} [clickCallback] - An optional click callback function
 * @attr {String | Number} [bufferDist] - An optional buffer distance that will be applied to the location geometry for the purpose of calculating the extent into which the map should be zoomed to
 * @description
 *  A reusable tile that will display location details and, optionally, allow to zoom the main map (controlled by the mapService) to the specified location
 */
angular.module('unionvmsWeb').directive('locationTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'LocationTileCtrl',
		scope: {
		    fieldTitle: '@',
		    locationDetails: '=',
		    isClickable: "=",
		    clickCallback: "&",
		    bufferDist: '@'
		},
		templateUrl: 'directive/activity/locationTile/locationTile.html'
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name LocationTileCtrl
 * @param $scope {Service} The controller scope
 * @param mapService {Service} The map service for the liveview map <p>{@link unionvmsWeb.mapService}</p>
 * @description
 *  The controller for the locationTile directive ({@link unionvmsWeb.locationTile})
 */
.controller('LocationTileCtrl', function($scope, mapService){
    /**
     * Zoom to the location in the liveview map and execute callback if defined
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias zoomToLocation
     */
    $scope.zoomToLocation = function(){
        //TODO test this function when we have it running with reports
        if ($scope.isClickable){
            var wkt = new ol.format.WKT();
            var geom = wkt.readGeometry($scope.locationDetails.geometry);
            
            var finalGeom;
            if (!angular.isDefined($scope.bufferDist)){
                finalGeom = geom;
            } else {
                var extent = ol.extent.buffer(geom.getExtent(), parseFloat($scope.bufferDist));
                finalGeom = ol.geom.Polygon.fromExtent(extent);
            }
            
            //mapService.zoomTo(geom);
            if (angular.isDefined($scope.clickCallback)){
                $scope.clickCallback();
            }
        }
    };
});
