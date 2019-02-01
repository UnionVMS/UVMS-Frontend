angular.module('unionvmsWeb').controller('PopupCtrl', function($scope, $rootScope, $modalInstance, microMovementRestService, dateTimeService, assetInfo) {
    $scope.data = assetInfo;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.showTrack = function() {
        let positionId = $scope.data.position.guid;
        console.log('show track for :', positionId);
        microMovementRestService.getTrackByMovementId(positionId).then((trackData) => {
                // track data is in string format, positions in an array, send these back
                // to draw segments.
                /*
                let coordData = [];
                let wktString = trackData.wkt;

                if (angular.isDefined(wktString) && wktString.indexOf("LINESTRING") !== -1) {
                    wktString = wktString.replace('LINESTRING (','').replace(')', '');
                    let coords = wktString.split(', ');
                    for (var i = 0;i < coords.length; i++) {
                        let loglat = coords[i].split(' ');
                        coordData.push(new Array(parseFloat(loglat[0]), parseFloat(loglat[1])));
                    }

                }
                */
                let data = {
                    data: $scope.data,
                    wkt: trackData.wkt
                };

                $rootScope.$broadcast('event:micromovement:track', data);
        });
    };
    $scope.removeTrack = function() {
        $rootScope.$broadcast('event:track:remove', $scope.data.position.asset);
    };
});

