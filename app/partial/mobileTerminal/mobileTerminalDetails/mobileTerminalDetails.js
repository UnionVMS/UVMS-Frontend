/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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