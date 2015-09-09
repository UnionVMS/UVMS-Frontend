var app = angular.module('unionvmsWeb').factory('mobileTerminalVesselService', function(vesselRestService, $q, GetListRequest, VesselListPage, userService) {

    var isAllowedToListVessels = function() {
        return userService.isAllowed('getVesselList', 'Vessel' ,true);
    };

    var getVesselsForListOfMobileTerminals = function(mobileTerminals){
        var deferred = $q.defer();

        try{
            if(!isAllowedToListVessels()){
                deferred.resolve(new VesselListPage());
                return deferred.promise;
            };

            //Check if any object has a connectId set
            var oneOrMoreConnectIdIsSet = false;
            $.each(mobileTerminals, function(index, mobileTerminal){
                if(angular.isDefined(mobileTerminal.connectId)){
                    oneOrMoreConnectIdIsSet = true;
                    return false;
                }
            });

            if(oneOrMoreConnectIdIsSet){
                //Create getListRequest for getting vessels by GUID
                var getVesselListRequest = new GetListRequest(1, mobileTerminals.length, false, []);
                $.each(mobileTerminals, function(index, mobileTerminal){
                    if(angular.isDefined(mobileTerminal.connectId) && typeof mobileTerminal.connectId === 'string' && mobileTerminal.connectId.trim().length >0){
                        getVesselListRequest.addSearchCriteria("GUID", mobileTerminal.connectId);
                    }
                });

                //Get vessels
                vesselRestService.getVesselList(getVesselListRequest).then(
                    function(vesselListPage){
                        //Return vesselListPage
                        deferred.resolve(vesselListPage);
                    },
                    function(error){
                        console.error("Error getting Vessels for the objects");
                        deferred.resolve(new VesselListPage());
                    }
                );
            }
            //No connectId to lookup, return list
            else{
                deferred.resolve(new VesselListPage());
            }
        }catch(err){
            deferred.resolve(new VesselListPage());
        }

        return deferred.promise;
    };

    //Get associated vessel for each mobileTerminal in the list
    //NOTE: mobileTerminals can also be a single mobileTerminal and not an array
    //Gets carrierInfo from "connectId" and sets "associatedVessel"
    //Returns list with updated mobileTerminals (associatedVessel set)
    var setAssociatedVesselsFromConnectId = function(mobileTerminals){
        var deferred = $q.defer();

        if(!isAllowedToListVessels()){
            deferred.resolve(mobileTerminals);
            return deferred.promise;
        };

        var mobileTerminalsIsAnArray = true;
        //Get vessels
        if(!_.isArray(mobileTerminals)){
            mobileTerminalsIsAnArray = false;
            mobileTerminals = [mobileTerminals];
        }

        getVesselsForListOfMobileTerminals(mobileTerminals).then(
            function(vesselListPage){
                //Connect the mobileTerminals to the vessels
                $.each(mobileTerminals, function(index, listObject){
                    if(angular.isDefined(listObject.connectId) && typeof listObject.connectId === 'string' && listObject.connectId.trim().length >0){
                        var matchingVessel = vesselListPage.getVesselByGuid(listObject.connectId);
                        if(angular.isDefined(matchingVessel)){
                            listObject.associatedVessel = matchingVessel;
                        }
                    }
                });
                if(mobileTerminalsIsAnArray){
                    deferred.resolve(mobileTerminals);
                }else{
                    deferred.resolve(mobileTerminals[0]);
                }
            },
            function(error){
                console.error("Error getting Vessels for the objects");
                if(mobileTerminalsIsAnArray){
                    deferred.resolve(mobileTerminals);
                }else{
                    deferred.resolve(mobileTerminals[0]);
                }
            }
        );

        return deferred.promise;
    };

    return {
        getVesselsForListOfMobileTerminals: getVesselsForListOfMobileTerminals,
        setAssociatedVesselsFromConnectId: setAssociatedVesselsFromConnectId
    };
});