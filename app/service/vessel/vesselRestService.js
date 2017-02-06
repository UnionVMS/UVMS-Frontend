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
    .factory('vesselRestFactory',function($resource) {

        return {
            getSearchableFields : function(){
                return $resource('/asset/rest/config/searchfields/');
            },
            vessel : function(){
                return $resource('/asset/rest/asset/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            archiveVessel: function() {
                return $resource('/asset/rest/asset/archive', {}, {
                    update: {method: 'PUT'}
                });
            },
            getVesselList : function(){
                return $resource('/asset/rest/asset/list/',{},{
                    list : { method: 'POST', cancellable: true}
                });
            },
            getVesselListCount : function(){
                return $resource('/asset/rest/asset/listcount/',{},{
                    list : { method: 'POST'}
                });
            },
            vesselGroup : function(){
                return $resource( '/asset/rest/group/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            getVesselGroupsForUser : function(){
                return $resource('/asset/rest/group/list');
            },
            vesselHistory : function(){
                return $resource('/asset/rest/history/asset');
            },
            getConfigValues : function(){
                return $resource('/asset/rest/config');
            },
            getConfigParameters : function(){
                return $resource('/asset/rest/config/parameters');
            },
            getNoteActivityList : function(){
                return $resource('/asset/rest/asset/activitycodes/');
            }
        };
    })
.factory('vesselRestService', function($q, $http, vesselRestFactory, VesselListPage, Vessel, SavedSearchGroup, userService, $timeout){

    //Save pending requests
    var pendingRequests = [];

    //Get vessel list
    var getVesselList = function(getListRequest){
        var deferred = $q.defer();

        var getVesselListRequest = vesselRestFactory.getVesselList().list(getListRequest.DTOForVessel(),
            function(response){
                if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var vessels = [];
                if(angular.isArray(response.data.asset)){
                    for (var i = 0; i < response.data.asset.length; i ++) {
                        vessels.push(Vessel.fromJson(response.data.asset[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var vesselListPage = new VesselListPage(vessels, currentPage, totalNumberOfPages);

                pendingRequests.splice(getVesselListRequest);
                deferred.resolve(vesselListPage);
            },
            function(err){
                console.error("Error getting vessels.", err);
                pendingRequests.splice(getVesselListRequest);
                deferred.reject(err);
            }
        );

        pendingRequests.push(getVesselListRequest);
        return deferred.promise;
    };

    //Count all vessels
    var getVesselListCount = function(getListRequest){
        var deferred = $q.defer(),
            countList = {pagination: {page: 1, listSize: 10000000}, assetSearchCriteria: {isDynamic: true, criterias: []}};
        vesselRestFactory.getVesselListCount().list(countList,function(response) {
                var getListRequest = (response.data);
                deferred.resolve(getListRequest);
            }
        );
        return deferred.promise;
    };

    //Get all vessels matching the search criterias in the list request
    var getAllMatchingVessels = function(getListRequest){

        //chunkSize: same as listSize in getListRequest
        //maxItems: max number of items to get
        var chunkSize = 1000,
            maxItems = 10000;

        var deferred = $q.defer();
        var vessels = [];
        var onSuccess = function(vesselListPage){
            vessels = vessels.concat(vesselListPage.items);

            //Last page, then return
            if(vesselListPage.isLastPage() || vesselListPage.items.length === 0 || vesselListPage.items.length < getListRequest.listSize){
                console.log("Found " +vessels.length +" vessels");
                return deferred.resolve(vessels);
            }
            //If more than maxItems, then return as well
            else if(vessels.length >= maxItems){
                console.log("Max number of items (" +maxItems +") have been found. Returning.");
                return deferred.resolve(vessels);
            }

            //Get next page
            getListRequest.page += 1;
            getVesselList(getListRequest).then(onSuccess, onError);
        };
        var onError = function(error){
            console.error("Error getting vessels.");
            return deferred.reject(error);
        };

        //Get vessels
        getListRequest.listSize = chunkSize;
        getVesselList(getListRequest).then(onSuccess, onError);

        return deferred.promise;
    };

    var createNewVessel = function(vessel){
        var deferred = $q.defer();
        vesselRestFactory.vessel().save(vessel.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject(response.data);
                return;
            }
            deferred.resolve(Vessel.fromJson(response.data));
        }, function(error) {
            console.error("Error creating vessel");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getVessel = function(vesselId) {
        var deferred = $q.defer();
        vesselRestFactory.vessel().get({id: vesselId}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(Vessel.fromJson(response.data));
        },
        function(err) {
            deferred.reject("could not load vessel with ID " + vesselId);
        });

        return deferred.promise;
    };

    var updateVessel = function(vessel){
        var deferred = $q.defer();
        vesselRestFactory.vessel().update(vessel.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Vessel.fromJson(response.data));
        }, function(error) {
            console.error("Error updating vessel");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var archiveVessel = function(vessel, comment){
        var deferred = $q.defer();
        vesselRestFactory.archiveVessel().update({ comment: comment }, vessel.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Vessel.fromJson(response.data));
        }, function(error) {
            console.error("Error updating vessel");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getSearchableFields = function (){
        var deferred = $q.defer();
        vesselRestFactory.getSearchableFields().get({
        }, function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            //TODO: parse and convert response.data to an object
            deferred.resolve(response.data);
        }, function(error) {
            console.error("Error getting searchable fields for vessel");
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getConfigurationFromResource = function(resource){
        var deferred = $q.defer();
        resource.get({},
            function(response){
                if(response.code !== 200){
                    deferred.reject("Not valid vessel configuration status.");
                    return;
                }
                deferred.resolve(response.data);
            }, function(error){
                console.error("Error getting configuration for vessel.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var getNoteActivityList = function(){
        return getConfigurationFromResource(vesselRestFactory.getNoteActivityList());
    };

    var getConfiguration = function(){
        return getConfigurationFromResource(vesselRestFactory.getConfigValues());
    };

    var getParameterConfiguration = function(){
        return getConfigurationFromResource(vesselRestFactory.getConfigParameters());
    };

    var getVesselHistoryListByVesselId = function (vesselId, maxNbr){
        var deferred = $q.defer();
        //Query object
        var queryObject = {
            assetId : vesselId
        };
        if(maxNbr){
            queryObject['maxNbr'] = maxNbr;
        }

        vesselRestFactory.vesselHistory().get(queryObject,
            function(response) {

                if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var vessels = [];
                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i ++) {
                        vessels.push(Vessel.fromJson(response.data[i]));
                    }
                }
                deferred.resolve(vessels);
            },
            function(err){
                deferred.reject(err);
            }
        );
        return deferred.promise;
    };

    var getVesselGroupsForUser = function (){
        var deferred = $q.defer();
        var userName = userService.getUserName();
        vesselRestFactory.getVesselGroupsForUser().get({'user' : userName},
            function(response) {

                if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var groups = [];
                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i ++) {
                        groups.push(SavedSearchGroup.fromVesselDTO(response.data[i]));
                    }
                }
                deferred.resolve(groups);
            },
            function(err){
                deferred.reject(err);
            }
        );
        return deferred.promise;
    };

    var createNewVesselGroup = function(savedSearchGroup){
        var deferred = $q.defer();
        vesselRestFactory.vesselGroup().save(savedSearchGroup.toVesselDTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromVesselDTO(response.data));
        }, function(error) {
            console.error("Error creating vessel group");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateVesselGroup = function(savedSearchGroup){
        var deferred = $q.defer();
        vesselRestFactory.vesselGroup().update(savedSearchGroup.toVesselDTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromVesselDTO(response.data));
        }, function(error) {
            console.error("Error updating vessel group");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var deleteVesselGroup = function(savedSearchGroup) {
        var deferred = $q.defer();
        vesselRestFactory.vesselGroup().delete({id: savedSearchGroup.id}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(SavedSearchGroup.fromVesselDTO(response.data));
        },
        function(error) {
            console.error("Error when trying to delete a vessel group");
            console.error(error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    //Cancel pending requests
    var cancelPendingRequests = function(){
        pendingRequests.forEach(function(request){
            request.$cancelRequest();
        });
    };

    return {
        getVesselList: getVesselList,
        getVesselListCount: getVesselListCount,
        getAllMatchingVessels: getAllMatchingVessels,
        updateVessel: updateVessel,
        archiveVessel: archiveVessel,
        createNewVessel: createNewVessel,
        getVessel: getVessel,
        getSearchableFields : getSearchableFields,
        getVesselHistoryListByVesselId : getVesselHistoryListByVesselId,
        getVesselGroupsForUser : getVesselGroupsForUser,
        createNewVesselGroup : createNewVesselGroup,
        updateVesselGroup : updateVesselGroup,
        deleteVesselGroup : deleteVesselGroup ,
        getConfig : getConfiguration,
        getParameterConfig : getParameterConfiguration,
        getNoteActivityList : getNoteActivityList,
        cancelPendingRequests : cancelPendingRequests
    };
});
