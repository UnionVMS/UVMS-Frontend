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
angular.module('unionvmsWeb').factory('searchService',function($q, $log, searchUtilsService, GetListRequest, VesselListPage, SearchField, vesselRestService, mobileTerminalRestService, pollingRestService, movementRestService, manualPositionRestService, GetPollableListRequest, SearchResultListPage, auditLogRestService, exchangeRestService, alarmRestService, userService) {

    var DEFAULT_ITEMS_PER_PAGE = 20,
        ALL_ITEMS = 10000000;

	var getListRequest = new GetListRequest(1, DEFAULT_ITEMS_PER_PAGE, true, []),
        advancedSearchObject  = {};

    //Transform array of string to dict with value true
    var searchKeysToMap = function(keysArray){
        return keysArray.reduce(function(map, searchKey) {
            map[searchKey] = true;
            return map;
        }, {});
    };

    //Keys that are searchable in the vessel search
    var vesselSearchKeys = searchKeysToMap([
        "MIN_LENGTH", "MAX_LENGTH", "MIN_POWER", "MAX_POWER", "GEAR_TYPE",
        "IMO", "GUID", "NAME", "IRCS",
        "MMSI", "EXTERNAL_MARKING", "CFR", "HOMEPORT",
        "FLAG_STATE", "LICENSE_TYPE", "ASSET_TYPE", "PRODUCER_NAME"
    ]);

    //Keys that are searchable in the exchange search
    var exchangeSearchKeys = searchKeysToMap([
        "TRANSFER_INCOMING", "DATE_RECEIVED_FROM", "DATE_RECEIVED_TO", "SENDER_RECEIVER", "RECIPIENT", "TYPE", "STATUS"
    ]);

    //Keys that are searchable in the exchange poll search
    var exchangePollSearchKeys = searchKeysToMap([
        "FROM_DATE", "TO_DATE", "STATUS"
    ]);

    var checkAccessToFeature = function(module, feature) {
        return userService.isAllowed(feature, module, true);
    };

    //First get movements, and the get the matching vessels
    var getMovements = function(movementRequest, isMinimalRequest) {
        var deferred = $q.defer();

        var getMovementOk = function(page) {
            //Zero results?
            if(page.getNumberOfItems() === 0){
                deferred.resolve(page);
                return;
            }

            //Get vessels for all movements in page
            var vesselRequest = new GetListRequest(1, page.getNumberOfItems(), true);
            $.each(page.items, function(index, movement) {
                if(angular.isDefined(movement.connectId)){
                    vesselRequest.addSearchCriteria("GUID", movement.connectId);
                }
            });
            vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                var vesselPage = new VesselListPage(vessels, 1, 1);
                //Update movement page by connecting each movement to a vessel
                $.each(page.items, function(index, movement) {
                    var vessel = vesselPage.getVesselByGuid(movement.connectId);
                    if(angular.isDefined(vessel)){
                        movement.setVessel(vessel);
                    }
                });

                deferred.resolve(page);

            }, function(error){
                onGetMovementsError(error, deferred);
            });
        };

        if (isMinimalRequest) {
            movementRestService.getMinimalMovementList(movementRequest).then(getMovementOk, function(error){
                onGetMovementsError(error, deferred);
            });
        } else {
            movementRestService.getMovementList(movementRequest).then(getMovementOk, function(error){
                onGetMovementsError(error, deferred);
            });
        }

        return deferred.promise;
    };

    //First get vessels, and the get the movements
    var getMovementsByVessels = function(vesselRequest, movementRequest, isMinimalRequest) {
        var deferred = $q.defer();
        vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels) {
            if (vessels.length === 0) {
                deferred.resolve(new SearchResultListPage());
                return;
            }

            var vesselsByGuid = {};
            $.each(vessels, function(index, vessel) {
                if(angular.isDefined(vessel.vesselId)){
                    movementRequest.addSearchCriteria("CONNECT_ID", vessel.vesselId.guid);
                    vesselsByGuid[vessel.vesselId.guid] = vessel;
                }
            });

            var getMovementOk = function(page) {
                $.each(page.items, function(index, movement) {
                    var vessel = vesselsByGuid[movement.connectId];
                    if(angular.isDefined(vessel)){
                        movement.setVessel(vessel);
                    }
                });

                deferred.resolve(page);
            };

            if (isMinimalRequest) {
                movementRestService.getMinimalMovementList(movementRequest).then(getMovementOk, function(error){
                    onGetMovementsError(error, deferred);
                });
            } else {
                movementRestService.getMovementList(movementRequest).then(getMovementOk, function(error){
                    onGetMovementsError(error, deferred);
                });
            }
        }, function(error){
            onGetMovementsError(error, deferred);
        });

        return deferred.promise;
    };

    //Handle error on get movements
    var onGetMovementsError = function(error, deferred){
        $log.error("Error getting Movements.", error);
        deferred.reject(error);
    };

    //Search alarms or ticket
    //searchType should be TICKETS or ALARMS
    //If a searchGetListRequest is provided, use that one instead of the getListRequest in this searchService
    var searchAlarmsOrTickets = function(searchType, searchGetListRequest){
        //Use the default getListRequest if searchListRequest is not provided
        if(angular.isUndefined(searchGetListRequest)){
            searchGetListRequest = new GetListRequest(1, ALL_ITEMS, true, getListRequest.criterias);
        }
        searchUtilsService.modifySpanAndTimeZones(searchGetListRequest.criterias);

        //Split into alarms/tickets and vessel criterias
        var partition = searchUtilsService.getSearchCriteriaPartition(searchGetListRequest.criterias, {vessel: vesselSearchKeys});
        var alarmsOrTicketsCritieria = partition["default"];
        var vesselCriteria = partition["vessel"];

        var vesselRequest = new GetListRequest(1, ALL_ITEMS, true, vesselCriteria);

        //Set the new search criterias (without vessel criterias)
        searchGetListRequest.setSearchCriterias(alarmsOrTicketsCritieria);

        var deferred = $q.defer();
        var vesselDeferred = $q.defer();

        //Get vessels first?
        if(vesselRequest.getNumberOfSearchCriterias() > 0){
            vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                //No vessel match? Then return empty page.
                if (vessels.length === 0) {
                    deferred.resolve(new SearchResultListPage());
                    return;
                }

                //Update alarms/tickest search criterias with vessels
                $.each(vessels, function(index, vessel) {
                    if(angular.isDefined(vessel.vesselId)){
                        searchGetListRequest.addSearchCriteria("ASSET_GUID", vessel.vesselId.guid);
                    }
                });
                vesselDeferred.resolve();
            }, function(error){
                $log.error("Error getting vessels and updating " +searchType +" search .", error);
                deferred.reject(error);
            });
        }else{
            vesselDeferred.resolve();
        }

        //Get alarms/tickets after vessels (or if vessels skipped)
        vesselDeferred.promise.then(function(){
            //Get alarms or tickets
            var searchPromise;
            if(searchType === 'ALARMS'){
                searchPromise = alarmRestService.getAlarmsList(searchGetListRequest);
            }else if (searchType === 'TICKETS'){
                searchPromise = alarmRestService.getTicketsListForCurrentUser(searchGetListRequest);
            }

            searchPromise.then(function(page) {
                //Zero results?
                if(page.getNumberOfItems() === 0){
                    deferred.resolve(page);
                    return;
                }

                //Get vessels for all vessel assets in page
                var vesselRequest = new GetListRequest(1, page.getNumberOfItems()*10, true);
                $.each(page.items, function(index, pageItem) {
                    //Search for vessels by GUID
                    if(angular.isDefined(pageItem.vesselGuid)){
                        vesselRequest.addSearchCriteria('GUID', pageItem.vesselGuid);
                    }
                });

                if(vesselRequest.getNumberOfSearchCriterias() === 0){
                    deferred.resolve(page);
                    return;
                }

                vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                    var vesselPage = new VesselListPage(vessels, 1, 1);
                    //Update alarms/tickets page by connecting each item to a vessel
                    $.each(page.items, function(index, pageItem) {
                        if(angular.isDefined(pageItem.vesselGuid)){
                            var vessel = vesselPage.getVesselByGuid(pageItem.vesselGuid);
                            if(angular.isDefined(vessel)){
                                pageItem.vessel = vessel;
                            }
                        }
                    });

                    deferred.resolve(page);

                }, function(error){
                    $log.error("Error getting and connecting vessels to " +searchType, error);
                    deferred.reject(error);
                });
            }, function(error){
                $log.error("Error getting " +searchType, error);
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };


	var searchService = {

        //Do the search for vessels based on latest movement
        searchLatestMovements : function(){
            var deferred = $q.defer();
            movementRestService.getLatestMovement(DEFAULT_ITEMS_PER_PAGE).then(function(latestMovements){
                $.each(latestMovements, function(index, latestMovement) {
                    getListRequest.addSearchCriteria("GUID", latestMovement.connectId);
                });

                if(checkAccessToFeature('Vessel')){
                    searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
                    searchUtilsService.replaceCommasWithPoint(getListRequest.criterias);
                    vesselRestService.getVesselList(getListRequest).then(function(vessels) {
                        if(vessels.getNumberOfItems() === 0){
                            return deferred.resolve(vessels);
                        } else {
                            var findGuid = function findGuid(connectId) {
                                for (var i = 0; i < latestMovements.length; i++) {
                                    if (latestMovements[i].connectId === connectId) {
                                        return latestMovements[i];
                                    }
                                }
                            };

                            $.each(vessels.items, function(index, vessel) {
                                vessel.lastMovement = findGuid(vessel.vesselId.guid);
                            });

                            if(latestMovements.length > 0) {
                                vessels.totalNumberOfLatestMovements = latestMovements.length;
                            }

                            deferred.resolve(vessels);
                        }
                    }, function(error){
                        $log.error("Error getting vessel list.", error);
                        deferred.reject(error);
                    });
                } else {
                    return deferred.reject();
                }
            }, function(error){
                $log.error("Error getting latest movements.", error);
                deferred.reject(error);
            });
            return deferred.promise;
        },

        //Do the search for vessels
		searchVessels : function(){
            var deferred = $q.defer(),
                getListRequestAllItems = new GetListRequest(1, ALL_ITEMS, false, getListRequest.criterias);

            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            searchUtilsService.replaceCommasWithPoint(getListRequest.criterias);

			vesselRestService.getVesselList(getListRequestAllItems).then(function(vesselPage){
                //Zero matches?
                if(vesselPage.getNumberOfItems() === 0){
                    return deferred.resolve(vesselPage);
                }
                //Get last report for the vessels
                if(checkAccessToFeature('Movement', 'viewMovements')){
                    var connectIds = [];
                    $.each(vesselPage.items, function(index, vessel) {
                        connectIds.push(vessel.getGuid());
                    });

                    movementRestService.getLatestMovementsByConnectIds(connectIds).then(function(movementsPage){
                        //Map movements to vessels
                        $.each(vesselPage.items, function(index, vessel) {
                            var movement = movementsPage.getItemByProperty('connectId', vessel.getGuid());
                            vessel.lastMovement = movement;
                        });
                        deferred.resolve(vesselPage);
                    }, function(error){
                        $log.error("Error getting last movements for vessels.", error);
                        deferred.resolve(vesselPage);
                    });
                }else{
                    deferred.resolve(vesselPage);
                }
            }, function(error){
                $log.error("Error getting vessels.", error);
                deferred.reject(error);
            });
            return deferred.promise;
		},

        //Count number of vessels
        searchNumberOfVessels : function(){
            var deferred = $q.defer();
            vesselRestService.getVesselListCount(getListRequest).then(function(countVessels){
                deferred.resolve(countVessels);
            }, function(error){
                $log.error("Error counting vessels.", error);
                deferred.reject(error);
            });
            return deferred.promise;
        },

        //Do the search for polls
        searchPolls : function(){
            var origGetListRequest = getListRequest.copy();
            searchUtilsService.modifySpanAndTimeZones(origGetListRequest.criterias);

            //Split into exchange, vessel and poll criterias
            var partition = searchUtilsService.getSearchCriteriaPartition(origGetListRequest.criterias, {exchangePoll: exchangePollSearchKeys, vessel: vesselSearchKeys});
            var pollingLogsCriteria = partition["default"];
            var exchangePollCriteria = partition["exchangePoll"];
            var vesselCriteria = partition["vessel"];
            origGetListRequest.setSearchCriterias(pollingLogsCriteria);

            var deferred = $q.defer(),
                promises = [];

            //Store the related vessels and exchangePollPage
            var vesselList = [],
                exchangePollPage;

            //Search for vessels first?
            var doVesselSearch = false;
            if(vesselCriteria.length > 0){
                var vesselDeferred = $q.defer();
                promises.push(vesselDeferred.promise);
                doVesselSearch = true;
                var vesselRequest = new GetListRequest(1, 10000, true, vesselCriteria);
                vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                    vesselList = vessels;
                    vesselDeferred.resolve();
                }, function(err){
                    vesselDeferred.reject("Error getting vessels.");
                });
            }

            //Search in exchange
            if (exchangePollCriteria.length === 0) {
                // Since there is no way to get info from exchange for multiple pollGuid, get all from the beginning of time if nothing else is set
                var exchangeSearchCriteria = [{"key":"FROM_DATE", "value":"1970-01-01 00:00:00 +00:00"}];
            }
            var exchangeDeferred = $q.defer();
            promises.push(exchangeDeferred.promise);
            var exchangeRequest = new GetListRequest(1, 10000, true, exchangePollCriteria);
            exchangeRestService.getPollMessages(exchangeRequest).then(
                function(page){
                    exchangePollPage = page;
                    exchangeDeferred.resolve();
                },
                function(err){
                    exchangeDeferred.reject("Error getting exchange poll messages.");
                }
            );

            //When we got vessels and exchangePolls
            $q.all(promises).then(function(){
                //No vessels found?
                if(doVesselSearch && vesselList.length === 0){
                    console.log("no vessels...return empty page");
                    return deferred.resolve(new SearchResultListPage());
                }
                //No exchange logs found?
                if(exchangePollPage.getNumberOfItems() === 0){
                    console.log("no exchange meessages...return empty page");
                    return deferred.resolve(new SearchResultListPage());
                }

                //Update serach criterias with pollIds and connectIds
                $.each(vesselList, function(i, vessel){
                    origGetListRequest.addSearchCriteria("CONNECT_ID", vessel.getGuid());
                });
                if(angular.isDefined(exchangePollPage)){
                    $.each(exchangePollPage.items, function(i, exchangePoll){
                        origGetListRequest.addSearchCriteria("POLL_ID", exchangePoll.pollGuid);
                    });
                }

                //Get polling logs
                pollingRestService.getPollList(origGetListRequest).then(
                    function(page) {
                        //Zero results?
                        if(page.getNumberOfItems() === 0){
                            deferred.resolve(page);
                            return;
                        }

                        //Empty promise list
                        promises.length = 0;
                        exchangeDeferred = $q.defer();
                        promises.push(exchangeDeferred.promise);
                        //Already got exchangePolls?
                        if(angular.isDefined(exchangePollPage)){
                            exchangeDeferred.resolve(exchangePollPage);
                        }
                        //Get exchangePoll from server
                        else{
                            if(page.getNumberOfItems() === 1){
                                var pollGuid = page.items[0].poll.id;
                                exchangeRestService.getPollMessage(pollGuid).then(function(exchangePoll){
                                    exchangePollPage = new SearchResultListPage([exchangePoll], 1, 1);
                                    exchangeDeferred.resolve();
                                }, function(err){
                                    exchangeDeferred.reject("Error getting exchange poll message.");
                                });
                            }else{
                                exchangeDeferred.reject("Cant get exchange items for more than one item at this point. Something went wrong.");
                            }
                        }

                        //Connect each poll to a vessel
                        vesselDeferred = $q.defer();
                        promises.push(vesselDeferred.promise);
                        //Already got vessels?
                        if(vesselList.length > 0){
                            vesselDeferred.resolve(vesselList);
                        }
                        //Get vessels from server
                        else{
                            var vesselRequest = new GetListRequest(1, page.getNumberOfItems(), true);
                            $.each(page.items, function(i, pollinglog) {
                                if(angular.isDefined(pollinglog.poll.connectionId) && pollinglog.poll.connectionId !== null){
                                    vesselRequest.addSearchCriteria("GUID", pollinglog.poll.connectionId);
                                }
                            });
                            if(vesselRequest.getNumberOfSearchCriterias() > 0){
                                vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                                    vesselList = vessels;
                                    vesselDeferred.resolve();
                                }, function(err){
                                    vesselDeferred.reject("Error getting vessels.");
                                });
                            }else{
                                //No vessels to search for
                                vesselDeferred.resolve();
                            }
                        }

                        //Now we get both vessels and exchangePolls so we can connect them to the polling logs
                        $q.all(promises).then(function(){
                            //Connect the poll items to exchangePolls
                            $.each(page.items, function(i, pollinglog){
                                $.each(exchangePollPage.items, function(j, exchangePoll){
                                    if(pollinglog.poll.id === exchangePoll.pollGuid){
                                        pollinglog.exchangePoll = exchangePoll;
                                        return false;
                                    }
                                });
                            });

                            //Conntect the poll items to vessels
                            var vesselListPage = new VesselListPage(vesselList, 1, 1);
                            $.each(page.items, function(i, pollinglog) {
                                var vessel = vesselListPage.getVesselByGuid(pollinglog.poll.connectionId);
                                pollinglog.vessel = vessel;
                            });

                            console.log(page);
                            deferred.resolve(page);
                        }, function(err){
                            $log.error("Error getting Pollinglogs.", err);
                            deferred.reject(err);
                        });
                    },
                    function(err){
                        $log.error("Error getting Pollinglogs.", err);
                        deferred.reject(err);
                    }
                );
            }, function(err){
                $log.error("Error getting Pollinglogs.", err);
                deferred.reject(err);
            });

            return deferred.promise;
        },

        //Do search for movements
        searchMovements : function(isMinimalRequest){
            //intercept request and set utc timezone on dates.
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            searchUtilsService.replaceCommasWithPoint(getListRequest.criterias);

            // Split search criteria into vessel and movement
            var allSearchCriteria = explodeCriterias(this.getSearchCriterias(), {'CFR_IRCS_NAME': ['CFR', 'IRCS', 'NAME']});
            var partition = searchUtilsService.getSearchCriteriaPartition(allSearchCriteria, {vessel: vesselSearchKeys});
            var movementCritieria = partition["default"];
            var vesselCriteria = partition["vessel"];

            var vesselRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, vesselCriteria);
            var movementRequest = new GetListRequest(getListRequest.page, ALL_ITEMS, getListRequest.isDynamic, movementCritieria);

            //Get vessels first?
            if(vesselRequest.getNumberOfSearchCriterias() > 0){
                return getMovementsByVessels(vesselRequest, movementRequest, isMinimalRequest);
            }else{
                return getMovements(movementRequest, isMinimalRequest);
            }
        },

        //search for manual positions.
        searchManualPositions : function(){
            return manualPositionRestService.getManualPositionList(getListRequest);
        },

        //Do search for pollables
        searchForPollableTerminals : function(){
            var getPollablesListRequest = new GetPollableListRequest(getListRequest.page, getListRequest.listSize);
            var getVesselsListRequest = getListRequest.copy();

            //Get vessels first!
            if(this.getSearchCriterias().length > 0){
                var deferred = $q.defer();
                var outerThis = this;

                //Get the vessels
                vesselRestService.getAllMatchingVessels(getVesselsListRequest).then(
                    //TODO: Get more pages of vessels or error message that too many vessels were returned?
                    function(vessels){
                        //If no matchin vessels found
                        if(vessels.length === 0){
                            return deferred.resolve(new SearchResultListPage());
                        }

                        //Iterate over the vessels and add vessel guids to the list of connectIds
                        $.each(vessels, function(index, vessel){
                            getPollablesListRequest.addConnectId(vessel.vesselId.guid);
                        });
                        //Get pollable channels
                        pollingRestService.getPollablesMobileTerminal(getPollablesListRequest).then(
                            function(pollableListPage){
                                return deferred.resolve(pollableListPage);
                            },
                            function(error){
                                return deferred.reject(error);
                            }
                        );
                    },
                    function(error){
                        console.error("Error getting channels.");
                        return deferred.reject(error);
                    }
                );
                return deferred.promise;
            }
            //No need to get vessels
            else{
                return  pollingRestService.getPollablesMobileTerminal(getPollablesListRequest);
            }

        },

        //Do the search for mobile terminals
        //If skipVesselSearch=true then no search to vessel module is performed
        // and all serach criterias are sent directly to mobile terminal search
        searchMobileTerminals : function(skipVesselSearch){

            var getAllListRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, getListRequest.criterias);

            //Get mobile terminals without getting vessels first
            if(skipVesselSearch){
                getAllListRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, getListRequest.criterias);
                return mobileTerminalRestService.getMobileTerminalList(getAllListRequest);
            }

            // Split search criteria into vessel and mobileTerminal
            var allSearchCriteria = this.getSearchCriterias();
            var partition = searchUtilsService.getSearchCriteriaPartition(allSearchCriteria, {vessel: vesselSearchKeys});
            var mobileCritieria = partition["default"];
            var vesselCriteria = partition["vessel"];

            //Check if there are any search criterias that need vessels to be searched first
            // and remove those search criterias
            var vesselSearchIsDynamic = true;
            $.each(vesselCriteria,function(index, searchField){
                if(searchField.key === 'GUID'){
                    vesselSearchIsDynamic = false;
                    return false;
                }
            });

            //Set the new search criterias (without vessel criterias)
            this.setSearchCriterias(mobileCritieria);

            //Get vessels first?
            if(vesselCriteria.length > 0){
                var deferred = $q.defer();
                var getVesselListRequest = new GetListRequest(1, ALL_ITEMS, vesselSearchIsDynamic, vesselCriteria);
                var outerThis = this;
                //Get the vessels
                vesselRestService.getAllMatchingVessels(getVesselListRequest).then(
                    function(vessels){
                        //If no matchin vessels found
                        if(vessels.length === 0){
                            return deferred.resolve(new SearchResultListPage());
                        }

                        //Iterate over the vessels to add new search criterias with CONNECT_ID as key and vessel GUID as value
                        $.each(vessels, function(index, vessel){
                            if(angular.isDefined(vessel.vesselId.guid)){
                                outerThis.addSearchCriteria("CONNECT_ID", vessel.vesselId.guid);
                            }
                        });
                        //Get mobile terminals
                        getAllListRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, getListRequest.criterias);
                        mobileTerminalRestService.getMobileTerminalList(getAllListRequest).then(
                            function(mobileTerminaListPage){
                                return deferred.resolve(mobileTerminaListPage);
                            },
                            function(error){
                                return deferred.reject(error);
                            }
                        );
                    },
                    function(error){
                        console.error("Error getting vessels for mobile search.");
                        return deferred.reject(error);
                    }
                );
                return deferred.promise;
            }
            //No need to get vessels
            else{
                getAllListRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, getListRequest.criterias);
                return mobileTerminalRestService.getMobileTerminalList(getAllListRequest);
            }
        },

        searchAuditLogs: function() {
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            var getAllListRequest = new GetListRequest(1, ALL_ITEMS, getListRequest.isDynamic, getListRequest.criterias);

            return auditLogRestService.getAuditLogList(getAllListRequest);
        },

        searchExchange: function() {
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            return exchangeRestService.getMessages(getListRequest);
        },

        searchTickets : function(searchGetListRequest){
            return searchAlarmsOrTickets('TICKETS', searchGetListRequest);
        },

        searchAlarms : function(searchGetListRequest){
            return searchAlarmsOrTickets('ALARMS', searchGetListRequest);
        },

        //Modify search request
        resetPage : function(){
            getListRequest.page = 1;
        },
        setPage : function(page){
            getListRequest.page = page;
        },
		increasePage : function(){
			getListRequest.page += 1;
		},
		setDynamic : function(dynamic){
			getListRequest.setDynamic(dynamic);
		},
		resetSearchCriterias : function(){
			getListRequest.resetCriterias();
		},
        addSearchCriteria : function(key, value){
            getListRequest.addSearchCriteria(key, value);
        },
        removeSearchCriteria : function(key){
			getListRequest.removeSearchCriteria(key);
		},
        hasSearchCriteria: function(key) {
            for (var i = 0; i < getListRequest.criterias.length; i++) {
                var searchField = getListRequest.criterias[i];
                if (searchField.key === key) {
                    return true;
                }
            }

            return false;
        },
		setSearchCriterias : function(newCriterias){
			getListRequest.setSearchCriterias(newCriterias);
		},
        getSearchCriterias : function(){
            return getListRequest.criterias;
        },
        getListRequest : function(){
            return getListRequest;
        },
        getAdvancedSearchObject : function(){
            return advancedSearchObject;
        },
        //Get the advanced search criterias as a list of SearchFields
        //Skip criterias that are in keysToSkipList
        getAdvancedSearchCriterias : function(keysToSkipList) {
            var criterias = [];
            $.each(advancedSearchObject, function(key, value) {
                if (!angular.isArray(keysToSkipList) || keysToSkipList.indexOf(key) < 0) {
                    pushCriteria(criterias, key, value);
                }
            });
            return criterias;
        },
        setSearchCriteriasToAdvancedSearch : function(){
            this.setSearchCriterias(this.getAdvancedSearchCriterias());
        },
        reset : function(){
            getListRequest = new GetListRequest(1, DEFAULT_ITEMS_PER_PAGE, true, []);
            this.resetAdvancedSearch();
        },
        resetAdvancedSearch : function(){
            for (var item in advancedSearchObject){
                if (advancedSearchObject[item] instanceof Array) {
                    advancedSearchObject[item] = [];
                }
                else {
                    delete advancedSearchObject[item];
                }
            }
        },

	};

    /* Create search field for numbers, strings or return existing search field object */
    function getSearchField(key, value) {
        if (angular.isNumber(value) || (angular.isString(value) && value.trim().length > 0)) {
            return new SearchField(key, value);
        }
        else if (angular.isObject(value)) {
            return value;
        }
    }

    function explodeCriterias(criterias, explodeMap) {
        for (var i = 0; i < criterias.length; i++) {
            if (explodeMap.hasOwnProperty(criterias[i].key)) {
                var criteria = criterias.splice(i, 1)[0];
                angular.forEach(explodeMap[criteria.key], function(k) {
                    criterias.splice(i++, 0, new SearchField(k, criteria.value));
                });
            }
        }

        return criterias;
    }

    /* Push {key,value} pair, possibly called recursively. */
    function pushCriteria(criterias, key, value) {
        if (angular.isArray(value)) {
            // Iterate over multiple values for this key
            angular.forEach(value, function(v) {
                pushCriteria(criterias, key, v);
            });
        }
        else {
            // Push the actual search field
            var searchField = getSearchField(key, value);
            if (angular.isDefined(searchField)) {
                criterias.push(searchField);
            }
        }
    }

	return searchService;
});
