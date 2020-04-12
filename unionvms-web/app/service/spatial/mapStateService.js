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
 * @ngdoc service
 * @name mapStateService
 * @param {Service} $localStorage - The ngStorage service
 * @description
 *  A service containing all available fields for positions, segments, tracks, alarms, trips and fishing activities
 *  and their visibility and order (in the tables) as defined by the admin/user preferences
 */
angular.module('unionvmsWeb').factory('mapStateService',function($localStorage, userService) {

    var mapStateService = {
        toStorage: function(state){
            if (!angular.isDefined($localStorage.mapState)){
                $localStorage.mapState = {};
            }
            $localStorage.mapState = state;
        },
        fromStorage: function(){
            if (angular.isDefined($localStorage.mapState)){
                return $localStorage.mapState;
            }
        },
        clearState: function () {
            if (angular.isDefined($localStorage.mapState)){
                delete $localStorage.mapState;
            }
        }
    };

    return mapStateService;
});