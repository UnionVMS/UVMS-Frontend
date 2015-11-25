angular.module('unionvmsWeb').controller('positionsMapModalCtrl',function($scope, $modalInstance, locale, dateTimeService, leafletBoundsHelpers, positionReports){
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
        $modalInstance.dismiss();
    };

    init();
});

angular.module('unionvmsWeb').factory('PositionsMapModal', function($modal) {
    return {
        show: function(positionReports) {
            return $modal.open({
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