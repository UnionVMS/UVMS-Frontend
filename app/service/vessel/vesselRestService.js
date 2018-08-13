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
                return $resource('asset/rest/config/searchfields/');
            },
            vessel : function(){
                return $resource('asset/rest/asset/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            archiveVessel: function() {
                return $resource('asset/rest/asset/archive', {}, {
                    update: {method: 'PUT'}
                });
            },
            getVesselList : function(){
                return $resource('asset/rest/asset/list/',{},{
                    list : { method: 'POST', cancellable: true}
                });
            },
            getVesselListCount : function(){
                return $resource('asset/rest/asset/listcount/',{},{
                    list : { method: 'POST'}
                });
            },
            vesselGroup : function(){
                return $resource( 'asset/rest/group/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            getVesselGroupsForUser : function(){
                return $resource('asset/rest/group/list');
            },
            vesselHistory : function(){
                return $resource('asset/rest/asset/history/asset/:id');
            },
            historyVessel : function(){
                return $resource('asset/rest/asset/history/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            getConfigValues : function(){
                return $resource('asset/rest/customcodes/listcodesforconstant/flag_state');
            },
            getConfigParameters : function(){
                return $resource('asset/rest/config/parameters');
            },
            getNoteActivityList : function(){
                return $resource('asset/rest/customcodes/listcodesforconstant/notesactcode');
            },
            contactsForAsset : function() {
            	return $resource('asset/rest/asset/:id/contacts');
            },
            updateContact : function() {
            	return $resource('asset/rest/asset/contacts', {}, {
                    update: {method: 'PUT'}
                });
            },
            deleteContact : function() {
            	return $resource('asset/rest/asset/contacts/:id');
            },
            notesForAsset : function() {
            	return $resource('asset/rest/asset/:id/notes');
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
            function(response, header, status){
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var vessels = [];
                if(angular.isArray(response.assetList)){
                    for (var i = 0; i < response.assetList.length; i ++) {
                        vessels.push(Vessel.fromJson(response.assetList[i]));
                    }
                }
                var currentPage = response.currentPage;
                var totalNumberOfPages = response.totalNumberOfPages;
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
        vesselRestFactory.vessel().save(vessel.DTO(), function(response, header, status) {
            if(status !== 200){
                deferred.reject(response);
                return;
            }
            deferred.resolve(Vessel.fromJson(response));
        }, function(error) {
            console.error("Error creating vessel");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getVessel = function(vesselId) {
        var deferred = $q.defer();
        vesselRestFactory.vessel().get({id: vesselId}, function(response, header, status) {
            if (status !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(Vessel.fromJson(response));
        },
        function(err) {
            deferred.reject("could not load vessel with ID " + vesselId);
        });

        return deferred.promise;
    };

    var updateVessel = function(vessel){
        var deferred = $q.defer();
        vesselRestFactory.vessel().update(vessel.DTO(), function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Vessel.fromJson(response));
        }, function(error) {
            console.error("Error updating vessel");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var archiveVessel = function(vessel, comment){
        var deferred = $q.defer();
        vesselRestFactory.archiveVessel().update({ comment: comment }, vessel.DTO(), function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Vessel.fromJson(response));
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
        }, function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            //TODO: parse and convert response.data to an object
            deferred.resolve(response);
        }, function(error) {
            console.error("Error getting searchable fields for vessel");
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getConfigurationFromResource = function(resource){
        var deferred = $q.defer();
        resource.get({},
            function(response, header, status){
                if(status !== 200){
                    deferred.reject("Not valid vessel configuration status.");
                    return;
                }
                deferred.resolve(response);
            }, function(error){
                console.error("Error getting configuration for vessel.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var getNoteActivityList = function(){
    	var deferred = $q.defer();
    	deferred.resolve({"code":["0","1","10","12","14","2","3","39","4","5","6","7","71","8","80","81","82","9","90","98","99","999","EL1","EL2","EL3","EL4","K01","K02","K03","K04","K06","K07","K08","K09","SAN","SAT","T1","T2","U1","U2","U3","V00","V01","V02","V03","V04","V05","V06","V07","V08","V09","V10","V11","V12","V13","V14","V15","V16","V17","V18","V19","V20","V21","V22","V23","V24","V25","V26","V28","V29","V30","V31","V32","V33","V35","V40","V41","V42","V43","V45","V49","V50","V51","V52","V53","V54","V60","V61","V62","V63","V65","V75","V80","V85","V86","V90","V92","V93","V95","V96","V98","V99","X1"]});
    	return deferred.promise;
//        return getConfigurationFromResource(vesselRestFactory.getNoteActivityList());
    };

    var getConfiguration = function(){
    	var deferred = $q.defer();
    	deferred.resolve({"UNIT_TONNAGE":["LONDON","OSLO"],"UNIT_LENGTH":["LOA","LBP"],"ASSET_TYPE":["VESSEL"],"LICENSE_TYPE":["MOCK-license-DB"],"GEAR_TYPE":["PELAGIC","DERMERSAL","DEMERSAL_AND_PELAGIC","UNKNOWN"],"FLAG_STATE":["SWE","DNK","NOR"],"SPAN_LENGTH_LOA":["0-11,99","12-14,99","15-17,99","18-23,99","24+"],"SPAN_POWER_MAIN":["0-99","100-199","200-299","300+"]});
    	return deferred.promise;
//        return getConfigurationFromResource(vesselRestFactory.getConfigValues());
    };

    var getParameterConfiguration = function(){
        return getConfigurationFromResource(vesselRestFactory.getConfigParameters());
    };

    var getVesselHistoryListByVesselId = function (vesselId, maxNbr){
        var deferred = $q.defer();
        //Query object
        var queryObject = {
        		id : vesselId
        };
        if(maxNbr){
            queryObject['maxNbr'] = maxNbr;
        }

        vesselRestFactory.vesselHistory().query(queryObject,
            function(response, header, status) {

                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var vessels = [];
                if(angular.isArray(response)){
                    for (var i = 0; i < response.length; i ++) {
                        vessels.push(Vessel.fromJson(response[i]));
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
    
    var getVesselByVesselHistoryId = function(vesselId) {
        var deferred = $q.defer();
        vesselRestFactory.historyVessel().get({id: vesselId}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(Vessel.fromJson(response.data));
        },
        function(err) {
            deferred.reject("could not load vessel with history ID " + vesselId);
        });

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
    
    var getContactsForAsset = function(vesselId) {
    	var deferred = $q.defer();
        vesselRestFactory.contactsForAsset().query({'id' : vesselId},
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
    };
    
    var createContactForAsset = function(vesselId, contact) {
    	var deferred = $q.defer();
        vesselRestFactory.contactsForAsset().save({'id' : vesselId}, contact,
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
    };

    var updateContact = function(contact) {
    	var deferred = $q.defer();
        vesselRestFactory.updateContact().update(contact,
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
    };
    
    var deleteContact = function(contactId) {
    	var deferred = $q.defer();
        vesselRestFactory.deleteContact().delete({'id' : contactId},
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
    };
    
    var getNotesForAsset = function(vesselId) {
    	var deferred = $q.defer();
        vesselRestFactory.notesForAsset().query({'id' : vesselId},
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
    };
    
    var createNoteForAsset = function(vesselId, note) {
    	var deferred = $q.defer();
        vesselRestFactory.notesForAsset().save({'id' : vesselId}, note,
            function(response, header, status) {
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(response);
        	},
        	function(err){
        		deferred.reject(err);
        	}
        );
        return deferred.promise;
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
        getVesselByVesselHistoryId : getVesselByVesselHistoryId,
        getVesselGroupsForUser : getVesselGroupsForUser,
        createNewVesselGroup : createNewVesselGroup,
        updateVesselGroup : updateVesselGroup,
        deleteVesselGroup : deleteVesselGroup ,
        getConfig : getConfiguration,
        getParameterConfig : getParameterConfiguration,
        getNoteActivityList : getNoteActivityList,
        cancelPendingRequests : cancelPendingRequests,
        getContactsForAsset : getContactsForAsset,
        createContactForAsset : createContactForAsset,
        updateContact : updateContact,
        deleteContact : deleteContact,
        getNotesForAsset : getNotesForAsset,
        createNoteForAsset : createNoteForAsset
    };
});
