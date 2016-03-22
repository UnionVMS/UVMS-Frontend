angular.module('unionvmsWeb').controller('mobileTerminal.channelController', ['$scope', function($scope) {

    $scope.$parent.$parent.$watchCollection('existingChannels', function(existingChannels) {
        validateChannel(existingChannels);
    });

    $scope.$watch('communicationChannel.ids.DNID', function() {
        validateChannel($scope.$parent.$parent.existingChannels);
    });

    $scope.$watch('communicationChannel.ids.MEMBER_NUMBER', function() {
        validateChannel($scope.$parent.$parent.existingChannels);
    });

    var validateChannel = function(existingChannels) {
        if (existingChannels === undefined) {
            existingChannels = [];
        }

        var alreadyExists = false;
        for (var i = 0; i < existingChannels.length; i++) {
            var existingChannel = existingChannels[i];
            if ($scope.communicationChannel.ids.DNID === existingChannel.dnid && $scope.communicationChannel.ids.MEMBER_NUMBER === existingChannel.memberNumber) {
                alreadyExists = true;
                break;
            }
        }

        if ($scope.channelForm) {
            if ($scope.channelForm.dnid) {
                $scope.channelForm.dnid.$setValidity('unique', !alreadyExists);
            }
            if ($scope.channelForm.memberId) {
                $scope.channelForm.memberId.$setValidity('unique', !alreadyExists);
            }
        }
    };

}]);