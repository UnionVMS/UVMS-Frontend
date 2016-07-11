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
angular.module('unionvmsWeb').factory('mobileTerminalVesselService', function(vesselRestService, $q, $log, GetListRequest, VesselListPage) {


    var getVesselsForListOfMobileTerminals = function(mobileTerminals){
        var deferred = $q.defer();

        try{
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
                        $log.error("Error getting Vessels for the objects");
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
                $log.error("Error getting Vessels for the objects");
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