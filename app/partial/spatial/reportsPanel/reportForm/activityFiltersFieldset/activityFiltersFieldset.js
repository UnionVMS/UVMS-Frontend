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
 * @name ActivityfiltersfieldsetCtrl
 * @param $scope {Service} controller scope
 * @description
 *  The controller for the activity filters fieldset
 */
angular.module('unionvmsWeb').controller('ActivityfiltersfieldsetCtrl',function($scope){

    //TODO replace the mocks when the REST service is ready
    $scope.reportTypes = [{
        code: 'NOTIFICATION', text: 'Notification'
    },{
        code: 'DECLARATION', text: 'Declaration'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.activityTypes = [{
        code: 'DEPARTURE', text: 'Departure'
    },{
        code: 'ARRIVAL', text: 'ARRIVAL'
    },{
        code: 'AREA_ENTRY', text: 'AREA_ENTRY'
    },{
        code: 'AREA_EXIT', text: 'AREA_ENTRY'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.ports = [{
        code: 'PORT1', text: 'PORT1'
    },{
        code: 'PORT2', text: 'PORT2'
    },{
        code: 'PORT3', text: 'PORT3'
    },{
        code: 'PORT4', text: 'PORT4'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.gearTypes = [{
        code: 'GNS', text: 'Set gillnets (anchored)'
    },{
        code: 'GND', text: 'Driftnets'
    },{
        code: 'GNC', text: 'Encircling gillnets'
    },{
        code: 'GTR', text: 'Combined gillnets-trammel nets'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.species = [{
        code: 'SOL', text: 'SOL'
    },{
        code: 'COD', text: 'COD'
    },{
        code: 'LEM', text: 'LEM'
    },{
        code: 'TUR', text: 'TUR'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.weightUnits = [{
        code: 'kg', text: 'Kg'
    },{
        code: 'ton', text: 'Ton'
    }];

});
