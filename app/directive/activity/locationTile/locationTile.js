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
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name locationTile
 * @attr {String} fieldTitle - The title of the fieldset tile
 * @attr {Object} locationDetails - An object containing the data to be used witin the tile (e.g. location name and geometry)
 * @attr {Boolean} isClickable - Whether the tile should be clickable or not so that we can zoom to the location in the main map controlled by the mapService ({@link unionvmsWeb.mapService})
 * @attr {Function} [clickCallback] - An optional click callback function
 * @attr {String | Number} [bufferDist] - An optional buffer distance that will be applied to the location geometry (only if it is a point geometry type) for the purpose of calculating the
 *       extent into which the map should be zoomed to
 * @description
 *  A reusable tile that will display location details (as a single location or a list of locations) and, optionally, allow to zoom the main map (controlled by the mapService) to the specified location
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
		    bufferDist: '@?',
		    multiple: "=?"
		},
		templateUrl: 'directive/activity/locationTile/locationTile.html',
		link: function(scope, element, attrs, fn) {
            if (!angular.isDefined(scope.multiple) && !angular.isDefined(attrs.multiple)){
                scope.multiple = false;
            }
        }
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
     * @param {Object} [item=$scope.locationDetails] - The object containing a geometry property to use for the zooming extent. If not defined, locationDetails object is the default.
     */
    $scope.zoomToLocation = function(item){
        if (!angular.isDefined(item)){
            if (_.isArray($scope.locationDetails)){
                item = $scope.locationDetails[0];
            } else {
                item = $scope.locationDetails;
            }
        }
        //TODO test this function when we have it running with reports
        if ($scope.isItemClickable(item)){
            var wkt = new ol.format.WKT();
            var geom = wkt.readGeometry(item.geometry);
            
            var finalGeom = geom;
            if (angular.isDefined($scope.bufferDist) && geom instanceof ol.geom.Point){
                var extent = ol.extent.buffer(geom.getExtent(), parseFloat($scope.bufferDist));
                finalGeom = ol.geom.Polygon.fromExtent(extent);
            }
            
            mapService.zoomTo(finalGeom);
            if (angular.isDefined($scope.clickCallback)){
                $scope.clickCallback();
            }
        }
    };
    
    /**
     * Check if the tile or item (when having multiple locations in a list) should be clickable
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias isItemClickable
     * @param {Object} [item] - An object that should contain a geometry property
     * @returns {Boolean} Whether the location tile or location item is clickable or not
     */
    $scope.isItemClickable = function(item){
        var clickableStatus = false;
        if ($scope.isClickable){
            if ($scope.multiple && angular.isDefined(item) && angular.isDefined(item.geometry) && item.geometry !== '' && item.geometry !== null){
                clickableStatus = true;
            } else if (!$scope.multiple && angular.isDefined($scope.locationDetails) && angular.isDefined($scope.locationDetails.geometry) && $scope.locationDetails.geometry !== '' && $scope.locationDetails.geometry !== null){
                clickableStatus = true;
            }
        }
        
        return clickableStatus;
    };
    
    /**
     * Check if there is data to be displayed on the tile, used for the html template
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias hasData
     * @returns {Boolean} Whether there is data to be displayed to not
     */
    $scope.hasData = function(){
        var status = true;
        if (!$scope.multiple && _.isEqual($scope.locationDetails, {})){
            status = false;
        } else if ($scope.multiple && $scope.locationDetails.length === 0){
            status = false;
        }
        
        return status;
    };
    
    /**
     * Check if the directive should behave as multiple or not. This is needed to check if locationDeatils is an array of a single item, where
     * in such case it should behave as not multiple
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias checkIsMultiple
     * @returns {Boolean} Whether the directive is using a multiple data source or not
     */
    $scope.checkIsMultiple = function(){
        var status = false;
        if ($scope.multiple && $scope.locationDetails.length > 1){
            status = true;
        }
        
        return status;
    };
});

