angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getTranspondersConfig : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/config/transponders');
            },
            mobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/', {}, {
                    update: {method: 'PUT'}
                });
            },
            getMobileTerminals : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/list/',{},{
                    list: { method: 'POST'}
                });
            },
            assignMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/assign/');
            },
            unassignMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/unassign/');
            },
            activateMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/status/activate', {}, {
                    save: {method: 'PUT'},
                });
            },
            inactivateMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/status/inactivate', {}, {
                    save: {method: 'PUT'},
                });
            },
            removeMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/status/remove', {}, {
                    save: {method: 'PUT'},
                });
            },
            mobileTerminalHistory : function(){
                return $resource(baseUrl +'/mobileterminal/rest/mobileterminal/history', {}, {
                    list: { method: 'PUT'}
                });
            },
        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, vesselRestService, MobileTerminal, MobileTerminalListPage, TranspondersConfig, GetListRequest, CarrierId, MobileTerminalHistory){

        //Get associated vessel for each object in the list
        //Gets carrierInfo from "carrierId" and sets "associatedVessel"
        //Returns list with updated objects (associatedVessel set)
        var setAssociatedVesselsFromCarrierId = function(listOfObjects){
            var deferred = $q.defer();

            try{
                //Check if any object has a carrierId set
                var oneOrMoreCarrierIdIsSet = false;
                $.each(listOfObjects, function(index, listObject){
                    if(angular.isDefined(listObject.carrierId) && angular.isDefined(listObject.carrierId.carrierType)){
                        oneOrMoreCarrierIdIsSet = true;
                        return false;
                    }
                });

                if(oneOrMoreCarrierIdIsSet){
                    //Create getListRequest for getting vessels by IRCS
                    var getVesselListRequest = new GetListRequest(1, listOfObjects.length, false, []);
                    $.each(listOfObjects, function(index, listObject){
                        if(angular.isDefined(listObject.carrierId)){
                            var carrierId = listObject.carrierId;
                            if (carrierId.carrierType === "VESSEL" && carrierId.idType === "IRCS" && typeof carrierId.value === 'string') {
                                getVesselListRequest.addSearchCriteria("IRCS", carrierId.value);
                            }
                        }
                    });

                    //Get vessels
                    vesselRestService.getVesselList(getVesselListRequest).then(
                        function(vesselListPage){
                            //Connect the mobileTerminals to the vessels
                            $.each(listOfObjects, function(index, listObject){
                                if(angular.isDefined(listObject.carrierId)){
                                    var carrierId = listObject.carrierId;
                                    if(carrierId.carrierType === "VESSEL" && carrierId.idType === "IRCS" && typeof carrierId.value === 'string'){
                                        var matchingVessel = vesselListPage.getVesselByIrcs(listObject.carrierId.value);
                                        if(angular.isDefined(matchingVessel)){
                                            listObject.associatedVessel = matchingVessel;
                                        }
                                    }
                                }
                            });
                            deferred.resolve(listOfObjects);
                        },
                        function(error){
                            console.error("Error getting Vessels for the objects");
                            deferred.resolve(listOfObjects);
                        }
                    );
                }
                //No carrierId to lookup, return list
                else{
                    deferred.resolve(listOfObjects);
                }
            }catch(err){
                deferred.resolve(listOfObjects);
            }

            return deferred.promise;
        };
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

            getMobileTerminalList : function(getListRequest){
                var deferred = $q.defer();
                //Get list of mobile terminals
                mobileTerminalRestFactory.getMobileTerminals().list(getListRequest.DTOForMobileTerminal(), function(response){
                        if(response.code !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var mobileTerminals = [],
                            mobileTerminalListPage;

                        //Create a MobileTerminalListPage object from the response
                        if(angular.isArray(response.data.mobileTerminal)) {
                            for (var i = 0; i < response.data.mobileTerminal.length; i++) {
                                mobileTerminals.push(MobileTerminal.fromJson(response.data.mobileTerminal[i]));
                            }
                        }
                        var currentPage = response.data.currentPage;
                        var totalNumberOfPages = response.data.totalNumberOfPages;
                        mobileTerminalListPage = new MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages);

                        //Get vessels for the mobileTerminals?
                        try{
                            setAssociatedVesselsFromCarrierId(mobileTerminalListPage.mobileTerminals).then(
                                function(updatedMobileTerminals){
                                    mobileTerminalListPage.mobileTerminals = updatedMobileTerminals;
                                    deferred.resolve(mobileTerminalListPage);
                                },
                                function(error){
                                    deferred.reject(mobileTerminalListPage);
                                });
                        }catch(err){
                            deferred.resolve(mobileTerminalListPage);
                        }
                    },
                function(error) {
                    console.error("Error getting mobile terminals");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;

            },

            createNewMobileTerminal : function(mobileTerminal){
                console.log("create new mobile terminal!");
                console.log(mobileTerminal.toJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().save(mobileTerminal.toJson(), function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    console.log("Create response!");
                    console.log(response);
                    deferred.resolve(MobileTerminal.fromJson(response.data));
                }, function(error) {
                    console.error("Error creating mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateMobileTerminal : function(mobileTerminal, comment){
                console.log("update mobile terminal!");
                console.log(mobileTerminal.toJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().update({ comment:comment }, mobileTerminal.toJson(), function(response) {
                    console.log("Update response!");
                    console.log(response);
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

            assignMobileTerminal : function(mobileTerminal, ircs, comment){
                console.log("assign mobile terminal!");
                var carrierId = CarrierId.createVesselWithIrcs(ircs);
                console.log(mobileTerminal.toAssignJson(carrierId));
                var deferred = $q.defer();
                mobileTerminalRestFactory.assignMobileTerminal().save({ comment:comment }, mobileTerminal.toAssignJson(carrierId), function(response) {
                    console.log("Assign response!");
                    console.log(response);
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
                console.log("unassign mobile terminal!");
                var unassignJson = mobileTerminal.toUnassignJson();
                console.log(mobileTerminal.toUnassignJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.unassignMobileTerminal().save({ comment:comment }, mobileTerminal.toUnassignJson(), function(response) {
                    console.log("Unassign response!");
                    console.log(response);
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
            getHistoryForMobileTerminal : function(mobileTerminal){
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminalHistory().list({guid: mobileTerminal.guid}, function(response) {
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

                    //Get associated carriers for the history items
                    setAssociatedVesselsFromCarrierId(history).then(
                        function(updatedHistory){
                            deferred.resolve(updatedHistory);
                        },
                        function(error){
                            deferred.reject(history);
                        });

                }, function(error) {
                    console.error("Error getting mobile terminal history.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

        };
        return mobileTerminalRestService;
    }
);
