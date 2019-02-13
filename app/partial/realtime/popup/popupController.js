angular.module('unionvmsWeb')
    .controller('PopupCtrl', function($scope, $rootScope, $modalInstance,  microMovementRestService, dateTimeService, assetInfo) {
    $scope.data = assetInfo;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.showTrack = function() {
        let positionId = $scope.data.position.guid;
        console.log('show track for :', positionId);
        microMovementRestService.getTrackByMovementId(positionId).then((trackData) => {
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

