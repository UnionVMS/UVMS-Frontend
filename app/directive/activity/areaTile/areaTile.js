/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http:pfishing//www.gnu.org/licenses/>.
*/
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name areaTile
 * @param  mapService {Service} The main map service <p>{@link unionvmsWeb.mapService}</p>
 * @attr {Array} ngModel - An array containing the data to be displayed in the tile
 * @attr {Boolean} isClickable - Whether the tile should be clickable or not
 * @attr {Function} [clickCallback] - An optional click callback function
 * @attr {String | Number} [bufferDist] - An optional buffer distance that will be applied to the area geometry (only if it is a point geometry type) for the purpose of calculating the
 *       extent into which the map should be zoomed to
 * @desc 
 *  A directive to be used within area exit and area entry partials. The tile will display clocks with entry or exiting times and a potentially
 *  clickable position to be zoomed in the map
 */
angular.module('unionvmsWeb').directive('areaTile', function (mapService) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            ngModel: '=',
            isClickable: "=",
            clickCallback: "&?",
            bufferDist: '@?'
        },
        templateUrl: 'directive/activity/areaTile/areaTile.html',
        link: function (scope, element, attrs, fn) {
            /**
             * The click function to zoom to the geometry of the record
             * 
             * @memberof areaTile
             * @public
             * @alias geometryClick
             * @param {Object} record - The clicked record object
             */
            scope.geometryClick = function (record) {
                if (scope.isItemClickable(record.geometry)){
                    var finalGeom = angular.copy(record.geometry);
                    if (angular.isDefined(scope.bufferDist) && record.geometry instanceof ol.geom.Point){
                        var extent = ol.extent.buffer(record.geometry.getExtent(), parseFloat(scope.bufferDist));
                        finalGeom = ol.geom.Polygon.fromExtent(extent);
                    }
                    
                    finalGeom.transform('EPSG:4326', mapService.getMapProjectionCode());
                    mapService.zoomTo(finalGeom);
                    if (angular.isDefined(scope.clickCallback)){
                        scope.clickCallback();
                    }
                }
            };
            
            /**
             * Check if a record should be clickable or not
             * 
             * @memberof areaTile
             * @public
             * @alias isItemClickable
             * @param {ol.geom} geometry - the ol geometry of the record
             * @returns {Boolean} Whether the record is clickable or not 
             */
            scope.isItemClickable = function(geometry){
                var clickableStatus = false;
                if (scope.isClickable){
                    if (angular.isDefined(geometry) && geometry !== '' && geometry !== null){
                        clickableStatus = true;
                    }
                }
                
                return clickableStatus;
            };
        }
    };
});
