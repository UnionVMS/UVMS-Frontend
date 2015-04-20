angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getTranspondersConfig : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/config/transponders');
            },
            mobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/', {}, {
                    update: {
                      method: 'PUT' // this method issues a PUT request
                    }                    
                });
            },
            getMobileTerminals : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/list/',{},{list : { method: 'POST'}
                });
            },
            assignMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/assign/');
            },
            unassignMobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/unassign/');
            },                         
        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, vesselRestService, MobileTerminal, MobileTerminalListPage, TranspondersConfig, GetListRequest){

        var mobileTerminalRestService = {

            getTranspondersConfig : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getTranspondersConfig().get({
                }, function(response) {
                    if(response.code !== "200"){
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
                mobileTerminalRestFactory.getMobileTerminals().list(getListRequest.toJson(), function(response){
                        if(response.code !== "200"){
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
                            if(mobileTerminalListPage.isOneOrMoreAssignedToACarrier()){
                                //Create getListRequest Get vessels for all mobileTerminals
                                var getVesselListRequest = new GetListRequest(1, getListRequest.listSize, false, []);
                                $.each(mobileTerminalListPage.mobileTerminals, function(index, mobileTerminal){
                                    if(angular.isDefined(mobileTerminal.carrierId)){
                                        if(mobileTerminal.carrierId.carrierType === "VESSEL" && mobileTerminal.carrierId.idType === "ID" && typeof mobileTerminal.carrierId.value === 'string'){
                                            getVesselListRequest.addSearchCriteria("INTERNAL_ID", mobileTerminal.carrierId.value);
                                        }                            
                                    }
                                });

                                //Get vessels
                                vesselRestService.getVesselList(getVesselListRequest).then(
                                    function(vesselListPage){
                                        //Connect the mobileTerminals to the vessels
                                        $.each(mobileTerminalListPage.mobileTerminals, function(index, mobileTerminal){
                                            if(angular.isDefined(mobileTerminal.carrierId)){
                                                if(mobileTerminal.carrierId.carrierType === "VESSEL" && mobileTerminal.carrierId.idType === "ID" && typeof mobileTerminal.carrierId.value === 'string'){
                                                    var matchingVessel = vesselListPage.getVesselByInternalId(mobileTerminal.carrierId.value);
                                                    if(angular.isDefined(matchingVessel)){
                                                        mobileTerminal.setAssociatedVessel(matchingVessel);
                                                    }
                                                }
                                            }
                                        });                                    
                                        deferred.resolve(mobileTerminalListPage);
                                    },
                                    function(error){
                                        console.error("Error getting Vessels for the mobileTerminals");
                                        deferred.resolve(mobileTerminalListPage);
                                    }                            
                                );
                            //No mobileTerminals assigned to carriers
                            }else{
                                deferred.resolve(mobileTerminalListPage);
                            }
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
                    if(response.code !== "200"){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    console.log("Create response!");
                    console.log(response);
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error creating mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            updateMobileTerminal : function(mobileTerminal){
                console.log("update mobile terminal!");
                console.log(mobileTerminal.toJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().update(mobileTerminal.toJson(), function(response) {
                    console.log("Update response!");
                    console.log(response);
                    if(response.code !== "200"){
                        deferred.reject("Invalid response status");
                        return;
                    }                    
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error updating mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },            

            assignMobileTerminal : function(mobileTerminal){
                console.log("assign mobile terminal!");
                console.log(mobileTerminal.toAssignJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.assignMobileTerminal().save(mobileTerminal.toAssignJson(), function(response) {
                    console.log("Assign response!");
                    console.log(response);
                    if(response.code !== "200"){
                        deferred.reject("Invalid response status");
                        return;
                    }                    
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error assigning mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },           
            unassignMobileTerminal : function(mobileTerminal){
                console.log("unassign mobile terminal!");
                console.log(mobileTerminal.toUnassignJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.unassignMobileTerminal().save(mobileTerminal.toUnassignJson(), function(response) {
                    console.log("Unassign response!");
                    console.log(response);
                    if(response.code !== "200"){
                        deferred.reject("Invalid response status");
                        return;
                    }                    
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error unassigning mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },               


        };
        return mobileTerminalRestService;
    }
);
