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
 * @name PrintFormCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} - The angular locale service
 * @param fishingActivityService {Service} the fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @description
 *  The controller for print form
 */
angular.module('unionvmsWeb').controller('PrintFormCtrl', function($scope, locale, fishingActivityService) {
    $scope.faServ = fishingActivityService;

    $scope.titleLabel = locale.getString('activity.title');
    $scope.authorLabel = locale.getString('activity.author');
    $scope.printLabel = locale.getString('activity.print');
});