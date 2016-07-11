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
angular.module('unionvmsWeb')
.factory('manualPositionRestFactory', function($resource){

    return {
        getMovementList : function(){
            return $resource('/movement/rest/movement/list',{},
            {
                list : { method : 'POST'}
            });
        },
        manualMovement: function() {
            return $resource('/movement/rest/tempmovement/:guid', {}, {
                update: { method: 'PUT' }
            });
        },
        manualMovements: function() {
            return $resource('/movement/rest/tempmovement/list', {}, {
                list: { method: 'POST' }
            });
        },
        deleteManualPositionReport : function(){
            return $resource('/movement/rest/tempmovement/remove/:guid', {}, {
                removePut: { method: 'PUT' }
            });
        },
        sendMovement: function() {
            return $resource( '/movement/rest/tempmovement/send/:guid', {}, {
                send: { method: 'PUT' }
            });
        }
    };
})
.factory('manualPositionRestService',function($q, manualPositionRestFactory, SearchResultListPage, ManualPosition){

    var createManualMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.manualMovement().save(movement.getDto(), function(response) {
            if(response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var getManualMovement = function(guid) {
        var deferred = $q.defer();
        manualPositionRestFactory.manualMovement().get({guid: guid}, function(response) {
            if (response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        },
        function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var updateManualMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.manualMovement().update(movement.getDto(), function(response) {
            if(response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var getManualPositionList = function(getListRequest){

        var deferred = $q.defer();
        getListRequest.listSize = 1000;
        manualPositionRestFactory.manualMovements().list(getListRequest.DTOForManualPosition(),
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var positions = [];
                
                if(angular.isArray(response.data.movement)){
                    for (var i = 0; i < response.data.movement.length; i++){
                        positions.push(ManualPosition.fromJson(response.data.movement[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var searchResultListPage = new SearchResultListPage(positions, currentPage, totalNumberOfPages);
                deferred.resolve(searchResultListPage);
            },
            function(error){
                console.log("Error getting positions.", error);               
                deferred.reject(error);
            }
        );
        return deferred.promise;
    
    };   

    var deleteManualPositionReport = function(manualPositionReport){
        var deferred = $q.defer();
        manualPositionRestFactory.deleteManualPositionReport().removePut({guid: manualPositionReport.guid}, {}, function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            console.error("Error when trying to delete a manual position report");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var sendMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.sendMovement().send({guid: movement.guid}, movement, function(response) {
            if (response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        },
        function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var saveAndSendMovement = function(movement) {
        // Update or create movement
        var createUpdatePromise;
        if (movement.guid) {
            createUpdatePromise = updateManualMovement(movement);
        }
        else {
            createUpdatePromise = createManualMovement(movement);
        }

        // Send the saved movement
        var deferred = $q.defer();
        createUpdatePromise.then(function(savedMovement) {
            sendMovement(savedMovement).then(function(sentMovement) {
                deferred.resolve(sentMovement);
            },
            function(sendError) {
                deferred.reject(sendError);
            });
        },
        function(createUpdateError) {
            deferred.reject(createUpdateError);
        });

        return deferred.promise;
    };

    return {
        createManualMovement: createManualMovement,
        getManualMovement: getManualMovement,
        updateManualMovement: updateManualMovement,
        getManualPositionList : getManualPositionList,
        deleteManualPositionReport : deleteManualPositionReport,
        saveAndSendMovement: saveAndSendMovement
     };

});