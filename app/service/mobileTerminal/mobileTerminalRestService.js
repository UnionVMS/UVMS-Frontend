angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource){
        return {
            getTranspondersConfig : function(){
                return $resource('/mobileterminal/rest/config/transponders');
            },
            getChannelNames : function(){
                return $resource('/mobileterminal/rest/config/channelnames');
            },
            getMobileTerminalByGuid : function(){
                return $resource('/mobileterminal/rest/mobileterminal/:id');
            },            
            mobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/', {}, {
                    update: {method: 'PUT'}
                });
            },
            getMobileTerminals : function(){
                return $resource('/mobileterminal/rest/mobileterminal/list/',{},{
                    list: { method: 'POST'}
                });
            },
            assignMobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/assign/');
            },
            unassignMobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/unassign/');
            },
            activateMobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/status/activate', {}, {
                    save: {method: 'PUT'},
                });
            },
            inactivateMobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/status/inactivate', {}, {
                    save: {method: 'PUT'},
                });
            },
            removeMobileTerminal : function(){
                return $resource('/mobileterminal/rest/mobileterminal/status/remove', {}, {
                    save: {method: 'PUT'},
                });
            },
            mobileTerminalHistory : function(){
                return $resource('/mobileterminal/rest/mobileterminal/history/:id', {}, {
                    list: { method: 'GET'}
                });
            },
            getConfigValues : function(){
                return $resource( '/mobileterminal/rest/config');
            }

        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, VesselListPage, MobileTerminal, SearchResultListPage, TranspondersConfig, GetListRequest, MobileTerminalHistory, mobileTerminalVesselService){

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
                    console.error("Error getting transponders config");
                    deferred.reject(error);
                });
                return deferred.promise;
            },


            getChannelNames : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getChannelNames().get({
                }, function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    //Return array of names
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error getting channel names from config");
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
                    console.error("Error getting mobile terminals");
                    console.error(error);
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
                    console.error("Error getting mobile terminal by GUID: " +guid);
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;

            },

            createNewMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().save(mobileTerminal.toJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    console.error("Error creating mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateMobileTerminal : function(mobileTerminal, comment){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().update({ comment:comment }, mobileTerminal.toJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    console.error("Error updating mobile terminal.");
                    console.error(error);
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
                    console.error("Error assigning mobile terminal.");
                    console.error(error);
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
                    console.error("Error unassigning mobile terminal.");
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
                    console.error("Error activating mobile terminal.");
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
                    console.error("Error inactivating mobile terminal.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            removeMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                mobileTerminalRestFactory.removeMobileTerminal().save(mobileTerminal.toSetStatusJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    console.error("Error removing mobile terminal.");
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
                        console.error("Error getting configuration values for mobileterminal.");
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
                    var history = [];
                    if(angular.isArray(response.data)){
                        for (var i = 0; i < response.data.length; i ++) {
                            history.push(MobileTerminalHistory.fromJson(response.data[i]));
                        }
                    }

                    deferred.resolve(history);
                }, function(error) {
                    console.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getHistoryWithAssociatedVesselForMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                this.getHistoryForMobileTerminalByGUID(mobileTerminal.guid).then(function(history){
                    //Get associated carriers for all mobile terminals in the history items
                    var mobileTerminals = [];
                    $.each(history, function(index, historyItem) {
                        mobileTerminals.push(historyItem.mobileTerminal);
                    });

                    mobileTerminalVesselService.getVesselsForListOfMobileTerminals(mobileTerminals).then(
                        function(vesselListPage){
                            //Connect the mobileTerminals to the vessels

                            $.each(history, function(index, historyItem){
                                var connectId = historyItem.mobileTerminal.connectId;
                                if(angular.isDefined(connectId) && typeof connectId === 'string' && connectId.trim().length >0){
                                    var matchingVessel = vesselListPage.getVesselByGuid(connectId);
                                        if(angular.isDefined(matchingVessel)){
                                            historyItem.mobileTerminal.associatedVessel = matchingVessel;
                                        }
                                    }
                            });

                            deferred.resolve(history);
                        },
                        function(error){
                            deferred.reject(history);
                        });
                }, function(error) {
                    console.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };
        return mobileTerminalRestService;
    }
);
