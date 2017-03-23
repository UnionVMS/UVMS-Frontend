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
 * @attr {String} [srcActivityGeom] - The WKT geometry string of the main fishing activity
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
		    srcActivityGeom: '='
		},
		templateUrl: 'directive/activity/locationTile/locationTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.$watch('locationDetails', function(newVal, oldVal){
		        if (angular.isDefined(newVal) && !_.isEqual(newVal, oldVal)){
		            scope.init();
		        }
		    });
        }
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name LocationTileCtrl
 * @param $scope {Service} The controller scope
 * @param mapService {Service} The map service for the liveview map <p>{@link unionvmsWeb.mapService}</p>
 * @param locale {Service} The angular locale service
 * @description
 *  The controller for the locationTile directive ({@link unionvmsWeb.locationTile})
 */
.controller('LocationTileCtrl', function($scope, mapService, locale){
    /**
     * Intialization function
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias init
     */
    $scope.init = function(){
        $scope.countries = [];
        $scope.rfmo = [];
        $scope.identifiers = [];
        $scope.positions = [];
        $scope.addresses = [];
        processData();
    };
    
    
    /**
     * Pre-process location details to fit the directive's structure
     * 
     * @memberof LocationTileCtrl
     * @private
     */
    function processData(){
        angular.forEach($scope.locationDetails, function(record){
            if (_.indexOf($scope.countries, record.country) === -1){
                $scope.countries.push(record.country);
            }
            
            if (_.indexOf($scope.rfmo, record.rfmoCode) === -1){
                $scope.rfmo.push(record.rfmoCode);
            }
            
            if (angular.isDefined(record.identifier)){
                var schemeId = locale.getString('activity.fa_details_item_' + record.identifier.schemeId.toLowerCase());
                $scope.identifiers.push({
                    id: record.identifier.id,
                    schemeId: schemeId !== "%%KEY_NOT_FOUND%%" ? schemeId : record.identifier.schemeId,
                    geometry: record.geometry
                });
            } else {
                //Here we get type = positions only from FLUX
                var wkt = new ol.format.WKT();
                var coords = wkt.readGeometry(record.geometry).getCoordinates();
                $scope.positions.push({
                    geometry: record.geometry,
                    lon: coords[0],
                    lat: coords[1]
                });
            }
            
            if (angular.isDefined(record.structuredAddress) && record.structuredAddress.length > 0){
                $scope.addresses.push(record.structuredAddress);
            }
        });
        
        if ($scope.addresses.length > 0){
            $scope.addresses = _.flatten($scope.addresses);
        }
        
        if (angular.isDefined($scope.srcActivityGeom)){
            $scope.activityGeom = {
                geometry: $scope.srcActivityGeom
            };
        }
    }
    
    /**
     * Zoom to the location in the liveview map and execute callback if defined
     * 
     * @memberof LocationTileCtrl
     * @public
     * @alias zoomToLocation
     * @param {Object} [item=$scope.locationDetails] - The object containing a geometry property to use for the zooming extent. If not defined, locationDetails object is the default.
     */
    $scope.zoomToLocation = function(item){
        //TODO test this function when we have it running with reports
        if ($scope.isItemClickable(item)){
            var wkt = new ol.format.WKT();
            var geom = wkt.readGeometry(item.geometry);
            
            var finalGeom = geom;
            if (angular.isDefined($scope.bufferDist) && geom instanceof ol.geom.Point){
                var extent = ol.extent.buffer(geom.getExtent(), parseFloat($scope.bufferDist));
                finalGeom = ol.geom.Polygon.fromExtent(extent);
            }
            
            finalGeom.transform('EPSG:4326', mapService.getMapProjectionCode());
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
            if (angular.isDefined(item.geometry) && item.geometry !== '' && item.geometry !== null){
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
        var status = false;
        if (angular.isDefined($scope.locationDetails) && $scope.locationDetails.length > 0){
            status = true;
        }
        
        return status;
    };
});

