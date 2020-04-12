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
    .factory('mobileTerminalRestFactory',function($resource, $log){
        return {
            getTranspondersConfig : function(){
                return $resource('mobileterminal/rest/config/transponders');
            },
            getMobileTerminalByGuid : function(){
                return $resource('mobileterminal/rest/mobileterminal/:id');
            },
            mobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/', {}, {
                    update: {method: 'PUT'}
                });
            },
            getMobileTerminals : function(){
                return $resource('mobileterminal/rest/mobileterminal/list/',{},{
                    list: { method: 'POST'}
                });
            },
            assignMobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/assign/');
            },
            unassignMobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/unassign/');
            },
            activateMobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/status/activate', {}, {
                    save: {method: 'PUT'}
                });
            },
            inactivateMobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/status/inactivate', {}, {
                    save: {method: 'PUT'}
                });
            },
            removeMobileTerminal : function(){
                return $resource('mobileterminal/rest/mobileterminal/status/remove', {}, {
                    save: {method: 'PUT'}
                });
            },
            mobileTerminalHistory : function(){
                return $resource('mobileterminal/rest/mobileterminal/history/:id', {}, {
                    list: { method: 'GET'}
                });
            },
            getConfigValues : function(){
                return $resource( 'mobileterminal/rest/config');
            }

        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, VesselListPage, MobileTerminal, SearchResultListPage, TranspondersConfig, GetListRequest, MobileTerminalHistory, mobileTerminalVesselService, $log){

        function getExistingMobileTerminalAttributes(data) {
            var mobileTerminal = {
                code: 2806,
                existingChannels: []
            };

            // Get serial number attribute
            if (data.attributes) {
                $.each(data.attributes, function(index, attribute) {
                    if (attribute.type === "SERIAL_NUMBER") {
                        mobileTerminal.serialNumber = attribute.value;
                    }
                });
            }

            if (data.channels) {
                $.each(data.channels, function(index, channel) {
                    if (channel.attributes) {
                        var dnid, memberNumber;
                        $.each(channel.attributes, function(index, attribute) {
                            if (attribute.type === 'DNID') {
                                 dnid = attribute.value;
                            }
                            else if (attribute.type === 'MEMBER_NUMBER') {
                                memberNumber = attribute.value;
                            }
                        });

                        if (dnid && memberNumber) {
                            var existingChannel = {dnid: dnid, memberNumber: memberNumber};
                            mobileTerminal.existingChannels.push(existingChannel);
                        }
                    }
                });
            }

            return mobileTerminal;
        }

        var mobileTerminalRestService = {

            getTranspondersConfig : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getTranspondersConfig().get({
                }, function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(TranspondersConfig.fromJson(response.data));
                }, function(error) {
                    $log.error("Error getting transponders config");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getMobileTerminalList : function(getListRequest, skipGettingVessel){
                var deferred = $q.defer();
                //Get list of mobile terminals
                mobileTerminalRestFactory.getMobileTerminals().list(getListRequest.DTOForMobileTerminal(), function(response){
                        if(response.code !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var mobileTerminals = [],
                            searchResultListPage;

                        //Create a SearchResultListPage object from the response
                        if(angular.isArray(response.data.mobileTerminal)) {
                            for (var i = 0; i < response.data.mobileTerminal.length; i++) {
                                mobileTerminals.push(MobileTerminal.fromJson(response.data.mobileTerminal[i]));
                            }
                        }
                        var currentPage = response.data.currentPage;
                        var totalNumberOfPages = response.data.totalNumberOfPages;
                        searchResultListPage = new SearchResultListPage(mobileTerminals, currentPage, totalNumberOfPages);

                        //Get vessels for the mobileTerminals?
                        if(skipGettingVessel){
                            deferred.resolve(searchResultListPage);
                            return;
                        }

                        //Get the associated vessels
                        try{
                            mobileTerminalVesselService.setAssociatedVesselsFromConnectId(searchResultListPage.items).then(
                                function(updatedMobileTerminals){
                                    searchResultListPage.items = updatedMobileTerminals;
                                    deferred.resolve(searchResultListPage);
                                },
                                function(error){
                                    deferred.reject(searchResultListPage);
                                });
                        }catch(err){
                            deferred.resolve(searchResultListPage);
                        }
                    },
                function(error) {
                    $log.error("Error getting mobile terminals");
                    deferred.reject(error);
                });
                return deferred.promise;

            },

            getMobileTerminalByGuid : function(guid){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getMobileTerminalByGuid().get({id:guid}, function(response){
                        if(response.code !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var mobileTerminal = MobileTerminal.fromJson(response.data);

                        //Get associated vessel for the mobileTerminal
                        try{
                            mobileTerminalVesselService.setAssociatedVesselsFromConnectId(mobileTerminal).then(
                                function(mobileTerminalWithAssociatedVessel){
                                    deferred.resolve(mobileTerminalWithAssociatedVessel);
                                },
                                function(error){
                                    deferred.reject(mobileTerminal);
                                });
                        }catch(err){
                            deferred.resolve(mobileTerminal);
                        }
                    },
                function(error) {
                    $log.error("Error getting mobile terminal by GUID: " +guid);
                    deferred.reject(error);
                });
                return deferred.promise;

            },

            createNewMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().save(mobileTerminal.toJson(), function(response) {
                    if (response.code === 2806) {
                        // This mobile terminal or one of its channel already exist
                        deferred.reject(getExistingMobileTerminalAttributes(response.data));
                        return;
                    }
                    else if(response.code !== 200) {
                        deferred.reject(response);
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error creating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().update({ comment:comment }, mobileTerminal.toJson(), function(response) {
                    if (response.code === 2806) {
                        // This mobile terminal or one of its channel already exist
                        deferred.reject(getExistingMobileTerminalAttributes(response.data));
                        return;
                    }
                    else if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error updating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            assignMobileTerminal : function(mobileTerminal, vesselGUID, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.assignMobileTerminal().save({ comment:comment }, mobileTerminal.toAssignJson(vesselGUID), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error assigning mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            unassignMobileTerminal : function(mobileTerminal, comment){
                var unassignJson = mobileTerminal.toUnassignJson();
                var deferred = $q.defer();
                mobileTerminalRestFactory.unassignMobileTerminal().save({ comment:comment }, mobileTerminal.toUnassignJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error unassigning mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            activateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.activateMobileTerminal().save({ comment:comment }, mobileTerminal.toSetStatusJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error activating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.inactivateMobileTerminal().save({ comment:comment }, mobileTerminal.toSetStatusJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error inactivating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateMobileTerminalsWithConnectId: function(connectId) {
                var deferred = $q.defer();
                function inactivatePage(page) {
                    var request = new GetListRequest(page, 10);
                    request.addSearchCriteria("CONNECT_ID", connectId);
                    mobileTerminalRestService.getMobileTerminalList(request).then(function(resultPage) {
                        $q.all(resultPage.items.map(function(mobileTerminal) {
                            return mobileTerminalRestService.inactivateMobileTerminal(mobileTerminal, "Inactivated because asset was archived");
                        })).then(function() {
                            if (resultPage.totalNumberOfPages > page) {
                                inactivatePage(page + 1);
                            }
                            else {
                                deferred.resolve();
                            }
                        });
                    });
                }

                // Initial recursive call for page 1
                inactivatePage(1);
               return deferred.promise;
            },
            removeMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.removeMobileTerminal().save({ comment:comment }, mobileTerminal.toSetStatusJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    $log.error("Error removing mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getConfig : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getConfigValues().get({},
                    function(response){
                        if(response.code !== 200){
                            deferred.reject("Not valid mobileterminal configuration status.");
                            return;
                        }
                        deferred.resolve(response.data);
                    }, function(error){
                        $log.error("Error getting configuration values for mobileterminal.");
                        deferred.reject(error);
                    });
                return deferred.promise;
            },
            getHistoryForMobileTerminalByGUID : function(mobileTerminalGUID){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminalHistory().get({id: mobileTerminalGUID}, function(response) {
                    if (response.code !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }
                    //Create list of MobileTerminalHistory
                    var history = MobileTerminalHistory.fromJson(response.data);

                    deferred.resolve(history);
                }, function(error) {
                    $log.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getHistoryWithAssociatedVesselForMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                this.getHistoryForMobileTerminalByGUID(mobileTerminal.guid).then(function(history){
                    //Get associated carriers for all mobile terminals in the history items
                    var mobileTerminals = [];
                    if (history) {
                        $.each(history.events, function(index, historyItem) {
                            mobileTerminals.push(historyItem);
                        });
                    }

                    mobileTerminalVesselService.getVesselsForListOfMobileTerminals(mobileTerminals).then(
                        function(vesselListPage){
                            //Connect the mobileTerminals to the vessels

                            $.each(history.events, function(index, historyItem){
                                var connectId = historyItem.connectId;
                                if(angular.isDefined(connectId) && typeof connectId === 'string' && connectId.trim().length >0){
                                    var matchingVessel = vesselListPage.getVesselByGuid(connectId);
                                        if(angular.isDefined(matchingVessel)){
                                            historyItem.associatedVessel = matchingVessel;
                                        }
                                    }
                            });

                            deferred.resolve(history);
                        },
                        function(error){
                            deferred.reject(history);
                        });
                }, function(error) {
                    $log.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            /* Returns ALL mobile terminals by fetchingt page-by-page, recursively. */
            getAllMobileTerminalsWithConnectId: function(connectId) {

                function getTerminalsRecursive(connectId, page) {

                    var mobileTerminalRequest = new GetListRequest();
                    mobileTerminalRequest.page = page;
                    mobileTerminalRequest.addSearchCriteria('CONNECT_ID', connectId);

                    return mobileTerminalRestService.getMobileTerminalList(mobileTerminalRequest).then(function(result) {
                        if (result.currentPage < result.totalNumberOfPages) {
                            return $q(function(resolve, reject) {
                                getTerminalsRecursive(connectId, page + 1).then(function(moreItems) {
                                    resolve(result.items.concat(moreItems));
                                }, function(error) {
                                    reject(error);
                                });
                            });
                        }
                        else {
                            return result.items;
                        }
                    });
                }

                return getTerminalsRecursive(connectId, 1);
            }
        };
        return mobileTerminalRestService;
    }
);
