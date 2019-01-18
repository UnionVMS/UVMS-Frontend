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
                return $resource('asset/rest/config/MT/transponders');
            },
            getMobileTerminalByGuid : function(){
                return $resource('asset/rest/mobileterminal/:id');
            },
            mobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/', {}, {
                    update: {method: 'PUT'}
                });
            },
            getMobileTerminals : function(){
                return $resource('asset/rest/mobileterminal/list/',{},{
                    list: { method: 'POST'}
                });
            },
            assignMobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/assign/', {}, {
                    save: { method: 'PUT'}
                });
            },
            unassignMobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/unassign/', {}, {
                    save: { method: 'PUT'}
                });
            },
            activateMobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/status/activate/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            inactivateMobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/status/inactivate/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            removeMobileTerminal : function(){
                return $resource('asset/rest/mobileterminal/status/remove/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            mobileTerminalHistory : function(){
                return $resource('asset/rest/mobileterminal/history/:id', {}, {
                    list: { method: 'GET'}
                });
            },
            getConfigValues : function(){
                return $resource('asset/rest/config/MT');
            }

        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, VesselListPage, MobileTerminal, SearchResultListPage, TranspondersConfig, GetListRequest, mobileTerminalVesselService, $log){

        function getExistingMobileTerminalAttributes(data) {
            var mobileTerminal = {
                code: 2806,
                existingChannels: []
            };

            mobileTerminal.serial_no = data.serial_no;

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
                }, function(response, headers, status) {
                    if(status !== 200){
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
                mobileTerminalRestFactory.getMobileTerminals().list(getListRequest.DTOForMobileTerminal(), function(response, headers, status) {
                        if(status !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var mobileTerminals = [],
                            searchResultListPage;

                        //Create a SearchResultListPage object from the response
                        if(angular.isArray(response.mobileTerminalList)) {
                            for (var i = 0; i < response.mobileTerminalList.length; i++) {
                                mobileTerminals.push(MobileTerminal.fromJson(response.mobileTerminalList[i]));
                            }
                        }
                        var currentPage = response.currentPage;
                        var totalNumberOfPages = response.totalNumberOfPages;
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
                mobileTerminalRestFactory.getMobileTerminalByGuid().get({id:guid}, function(response, headers, status) {
                        if(status !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var mobileTerminal = MobileTerminal.fromJson(response);

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
                mobileTerminalRestFactory.mobileTerminal().save(mobileTerminal.toJson(), function(response, headers, status) {
                    if (status === 2806) {
                        // This mobile terminal or one of its channel already exist
                        deferred.reject(getExistingMobileTerminalAttributes(response));
                        return;
                    }
                    else if(status !== 200) {
                        deferred.reject(response);
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error creating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().update({ comment:comment }, mobileTerminal.toJson(), function(response, headers, status) {
                    if (status === 2806) {
                        // This mobile terminal or one of its channel already exist
                        deferred.reject(getExistingMobileTerminalAttributes(response));
                        return;
                    }
                    else if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error updating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            assignMobileTerminal : function(mobileTerminal, vesselGUID, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.assignMobileTerminal().save({ comment: comment, connectId: vesselGUID }, JSON.stringify(mobileTerminal.id), function(response, headers, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error assigning mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            unassignMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.unassignMobileTerminal().save({ comment: comment, connectId: mobileTerminal.connectId }, JSON.stringify(mobileTerminal.id), function(response, headers, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error unassigning mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            activateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.activateMobileTerminal().save({ comment:comment }, JSON.stringify(mobileTerminal.id), function(response, headers, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error activating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.inactivateMobileTerminal().save({ comment:comment }, JSON.stringify(mobileTerminal.id), function(response, headers, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
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
                mobileTerminalRestFactory.removeMobileTerminal().save({ comment:comment }, JSON.stringify(mobileTerminal.id), function(response, headers, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response));
                }, function(error) {
                    $log.error("Error removing mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getConfig : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getConfigValues().get({},
                    function(response, headers, status) {
                        if(status !== 200){
                            deferred.reject("Not valid mobileterminal configuration status.");
                            return;
                        }
                        deferred.resolve(response);
                    }, function(error){
                        $log.error("Error getting configuration values for mobileterminal.");
                        deferred.reject(error);
                    });
                return deferred.promise;
            },
            getHistoryForMobileTerminalByGUID : function(mobileTerminalGUID, maxNbr){
                var deferred = $q.defer();
                
                var queryObject = {
                        id : mobileTerminalGUID
                    };

                if(maxNbr){
                	queryObject['maxNbr'] = maxNbr;
                }
                
                mobileTerminalRestFactory.mobileTerminalHistory().query(queryObject, function(response, headers, status) {
                    if (status !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }

                    deferred.resolve(response);
                }, function(error) {
                    $log.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getHistoryWithAssociatedVesselForMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                this.getHistoryForMobileTerminalByGUID(mobileTerminal.id, 15).then(function(history){
                    //Get associated carriers for all mobile terminals in the history items
                    var mobileTerminals = [];
                    if (history) {
                        $.each(history, function(index, historyItem) {
                            mobileTerminals.push(MobileTerminal.fromJson(historyItem));
                        });
                    }

                    mobileTerminalVesselService.getVesselsForListOfMobileTerminals(mobileTerminals).then(
                        function(vesselListPage){
                            //Connect the mobileTerminals to the vessels

                            $.each(mobileTerminals, function(index, historyItem){
                                var connectId = historyItem.connectId;
                                if(angular.isDefined(connectId) && typeof connectId === 'string' && connectId.trim().length >0){
                                    var matchingVessel = vesselListPage.getVesselByGuid(connectId);
                                        if(angular.isDefined(matchingVessel)){
                                            historyItem.associatedVessel = matchingVessel;
                                        }
                                    }
                            });

                            deferred.resolve(mobileTerminals);
                        },
                        function(error){
                            deferred.reject(mobileTerminals);
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
