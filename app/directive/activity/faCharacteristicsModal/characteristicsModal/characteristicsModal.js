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
 * @ngdoc controller
 * @name CharacteristicsModalCtrl
 * @param $scope {Service} controller scope
 * @param $uibModalInstance {Service} angular service modalInstance
 * @param {Object} modalData - data for characteristics modal
 * @description
 *  The controller for characteristics modal
 */
angular.module('unionvmsWeb').controller('CharacteristicsModalCtrl', function($scope, $uibModalInstance, modalData, locale) {

    $scope.characteristics = [];

    angular.forEach(modalData, function(value, key) {
        var itemLabel = locale.getString('activity.fa_details_item_' + key.toLowerCase());
        $scope.characteristics.push({
            key: itemLabel !== "%%KEY_NOT_FOUND%%" ? itemLabel : key,
            value: (angular.isArray(value) === true ? value.join(", ") : value)
        });
    });
    
    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
});