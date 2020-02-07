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
angular.module('unionvmsWeb').controller('positionsMapModalCtrl',function($scope, $uibModalInstance, locale, dateTimeService, leafletBoundsHelpers, positionReports){
    $scope.markers = {};
    $scope.bounds = {};
    $scope.center = {};

    var init = function(){
        addMarkers();
        setMapBounds();
    };

    //Add markers to the map
    var addMarkers = function(){
        //Add a marker for each position report
        $.each(positionReports, function(index, positionReport){
            $scope.markers[index] = {
                lat: positionReport.movement.latitude,
                lng: positionReport.movement.longitude,
                message: locale.getString("movement.positions_map_modal_marker_popup", {
                    name : angular.isDefined(positionReport.vessel) ? positionReport.vessel.name : '-',
                    time : dateTimeService.formatAccordingToUserSettings(positionReport.time)
                }),
            };
        });
    };

    //Set the map bounds to fit all markers
    var setMapBounds = function(){
        var latLngs = [];
        $.each($scope.markers, function(index, marker){
            latLngs.push([marker.lat, marker.lng]);
        });
        var bounds = new L.LatLngBounds(latLngs);
        $scope.bounds = {northEast : bounds._northEast, southWest : bounds._southWest};
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };

    init();
});

angular.module('unionvmsWeb').factory('PositionsMapModal', function($uibModal) {
    return {
        show: function(positionReports) {
            return $uibModal.open({
                templateUrl: 'partial/movement/positionsMapModal/positionsMapModal.html',
                controller: 'positionsMapModalCtrl',
                backdrop: 'static', //will not close when clicking outside the modal window
                size: 'md',
                resolve:{
                    positionReports : function (){
                        return positionReports;
                    },
                }
            }).result;
        }
    };
});
