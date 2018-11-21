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
angular.module('unionvmsWeb')
.factory('microMovementRestFactory', function($resource){

    return {
        getMovementList : function(){
            return $resource('movement/rest/movement/microMovementListAfter/:timestamp');
        },
        getTrackById : function () {
            return $resource('movement/rest/track/:id');
        },
        getSegmentByMovementGuid : function () {
            return $resource('movement/rest/segment/segmentByDestinationMovement/:moveId');
        }
    };
})

.factory('microMovementRestService',function($q, microMovementRestFactory, MicroMovement){

    let getMovementList = function(date){
        let deferred = $q.defer();
        microMovementRestFactory.getMovementList().get({timestamp: date}, function(result) {
                deferred.resolve(result);
            },
            function(error){
                console.log("Error getting positions.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;

    };

    let getTrackById = function(id) {
        let deferred = $q.defer();
        microMovementRestFactory.getTrackById().get({id: id}, function(result) {
                deferred.resolve(result);
            },
            function(error){
                console.log("Error getting track info.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    let getSegmentByMovementGuid = function(moveId) {
        let deferred = $q.defer();
        microMovementRestFactory.getSegmentByMovementGuid().get({moveId: moveId}, function(result) {
                deferred.resolve(result);
            },
            function(error){
                console.log("Error getting segment info.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    return {
        getMovementList : getMovementList,
        getTrackById : getTrackById,
        getSegmentByMovementGuid : getSegmentByMovementGuid
    };

});
