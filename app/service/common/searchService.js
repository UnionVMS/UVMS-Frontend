angular.module('unionvmsWeb').factory('searchService',function($q, $log, searchUtilsService, GetListRequest, VesselListPage, SearchField, vesselRestService, mobileTerminalRestService, pollingRestService, movementRestService, manualPositionRestService, GetPollableListRequest, SearchResultListPage, auditLogRestService, exchangeRestService, alarmRestService) {

	var getListRequest = new GetListRequest(1, 20, true, []),
        advancedSearchObject  = {};

    //Keys that are searchable in the vessel module
    var vesselSearchKeys = [
        "MIN_LENGTH", "MAX_LENGTH", "MIN_POWER", "MAX_POWER", "GEAR_TYPE",
        "IMO", "GUID", "NAME", "IRCS",
        "MMSI", "EXTERNAL_MARKING", "CFR", "HOMEPORT",
        "FLAG_STATE", "LICENSE_TYPE", "ASSET_TYPE", "PRODUCER_NAME"
    ].reduce(function(map, searchKey) {
        map[searchKey] = true;
        return map;
    }, {});

    //First get movements, and the get the matching vessels
    var getMovements = function(movementRequest) {
        var deferred = $q.defer();
        movementRestService.getMovementList(movementRequest).then(function(page) {
            //Zero results?
            if(page.getNumberOfItems() === 0){
                deferred.resolve(page);
                return;
            }

            //Get vessels for all movements in page
            var vesselRequest = new GetListRequest(1, page.getNumberOfItems(), true);
            $.each(page.items, function(index, movement) {
                vesselRequest.addSearchCriteria("GUID", movement.connectId);
            });
            vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){
                var vesselPage = new VesselListPage(vessels, 1, 1);
                //Update movement page by connecting each movement to a vessel
                $.each(page.items, function(index, movement) {
                    var vessel = vesselPage.getVesselByGuid(movement.connectId);
                    if(angular.isDefined(vessel)){
                        movement.setVesselData(vessel);
                    }
                });

                deferred.resolve(page);

            }, function(error){
                onGetMovementsError(error, deferred);
            });
        }, function(error){
            onGetMovementsError(error, deferred);
        });

        return deferred.promise;
    };

    //First get vessels, and the get the movements
    var getMovementsByVessels = function(vesselRequest, movementRequest) {
        var deferred = $q.defer();
        vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels) {
            if (vessels.length === 0) {
                deferred.resolve(new SearchResultListPage());
                return;
            }

            var vesselsByGuid = {};
            $.each(vessels, function(index, vessel) {
                movementRequest.addSearchCriteria("CONNECT_ID", vessel.vesselId.guid);
                vesselsByGuid[vessel.vesselId.guid] = vessel;
            });

            movementRestService.getMovementList(movementRequest).then(function(page) {
                $.each(page.items, function(index, movement) {
                    var vessel = vesselsByGuid[movement.connectId];
                    if(angular.isDefined(vessel)){
                        movement.setVesselData(vessel);
                    }
                });

                deferred.resolve(page);

            }, function(error){
                onGetMovementsError(error, deferred);
            });
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

    //Handle error on get pollinglogs
    var onGetPollinglogsError = function(error, deferred){
        $log.error("Error getting Pollinglogs.", error);
        deferred.reject(error);
    };

	var searchService = {

        //Do the search for vessels
		searchVessels : function(){
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
			return vesselRestService.getVesselList(getListRequest);
		},

        //Do the search for polls
        searchPolls : function(){
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);

            //TODO: Replace mock-ids this when exchange is in place
            getListRequest.criterias = [
                {"key" :"POLL_ID", "value":"21c481af-6ce4-471a-87e6-7c941aeb3197"},
                {"key" :"POLL_ID", "value":"020cbba6-06f1-477e-a463-621a27ed0a09"}
            ];

            var deferred = $q.defer();
            pollingRestService.getPollList(getListRequest).then(function(page) {
            //Zero results?
            if(page.getNumberOfItems() === 0){
                deferred.resolve(page);
                return;
            }

            //Get vessels for all movements in page
            var vesselRequest = new GetListRequest(1, page.getNumberOfItems(), true);
            $.each(page.items, function(index, pollinglog) {
                vesselRequest.addSearchCriteria("GUID", pollinglog.poll.connectionId);
            });
            vesselRestService.getAllMatchingVessels(vesselRequest).then(function(vessels){

                var vesselListPage = new VesselListPage(vessels, 1, 10000);
                //Update pollinglog page by connecting each pollinglog to a vessel in order to get vesselname etc.
                $.each(page.items, function(index, pollinglog) {
                    var vessel = vesselListPage.getVesselByGuid(pollinglog.poll.connectionId);
                    pollinglog.vessel = vessel;
                });

                deferred.resolve(page);

            }, function(error){
                onGetPollinglogsError(error, deferred);
               });

            }, function(error){
                onGetPollinglogsError(error, deferred);
                });

            return deferred.promise;
        },

        //Do search for movements
        searchMovements : function(){
            //intercept request and set utc timezone on dates.
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);

            // Split search criteria into vessel and movement
            var allSearchCriteria = this.getSearchCriterias();
            var partition = searchUtilsService.getSearchCriteriaPartition(allSearchCriteria, {vessel: vesselSearchKeys});
            var movementCritieria = partition["default"];
            var vesselCriteria = partition["vessel"];

            var vesselRequest = new GetListRequest(1, 1000, true, vesselCriteria);
            var movementRequest = new GetListRequest(getListRequest.page, getListRequest.listSize, getListRequest.isDynamic, movementCritieria);

            //Get vessels first?
            if(vesselRequest.getNumberOfSearchCriterias() > 0){
                return getMovementsByVessels(vesselRequest, movementRequest);
            }else{
                return getMovements(movementRequest);
            }
        },

        //search for manual positions.
        searchManualPositions : function(){
            return manualPositionRestService.getManualPositionList(getListRequest);
        },

        //Do search for pollables
        searchForPollableTerminals : function(){
            var getPollablesListRequest = new GetPollableListRequest(getListRequest.page, getListRequest.listSize);

            //Get vessels first!
            if(this.getSearchCriterias().length > 0){
                var deferred = $q.defer();
                var outerThis = this;

                //Get the vessels
                vesselRestService.getAllMatchingVessels(getListRequest).then(
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

            //Get mobile terminals without getting vessels first
            if(skipVesselSearch){
                return mobileTerminalRestService.getMobileTerminalList(getListRequest);
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
                var getVesselListRequest = new GetListRequest(1, 1000, vesselSearchIsDynamic, vesselCriteria);
                var outerThis = this;
                //Get the vessels
                vesselRestService.getAllMatchingVessels(getVesselListRequest).then(
                    //TODO: Get more pages of vessels or error message that too many vessels were returned?
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
                        mobileTerminalRestService.getMobileTerminalList(getListRequest).then(
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
                return mobileTerminalRestService.getMobileTerminalList(getListRequest);
            }
        },

        searchAuditLogs: function() {
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            return auditLogRestService.getAuditLogList(getListRequest);
        },

        searchExchange: function(servicePath) {
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            return exchangeRestService.getExchangeMessages(getListRequest, servicePath);
        },

        searchTickets : function(){
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            return alarmRestService.getTicketsList(getListRequest);
        },

        searchAlarms : function(){
            searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
            return alarmRestService.getAlarmsList(getListRequest);
        },

        //Modify search request
        resetPage : function(){
            getListRequest.page = 1;
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
        getAdvancedSearchCriterias : function(keysToSkipList){
            var criterias = [];
            $.each(advancedSearchObject, function(key, value){
                //Don't use the values in the skipList
                if(angular.isUndefined(keysToSkipList) || keysToSkipList.indexOf(key) < 0){
                    //Skip empty values
                    if (typeof value === 'string' && value.trim().length !== 0){
                        criterias.push(new SearchField(key, value));
                    }
                    else if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            if (typeof value[i] === 'string' && value[i].trim().length !== 0) {
                                criterias.push(new SearchField(key, value[i]));
                            }
                            if ( typeof value[i] === "object") {
                                criterias.push(value[i]);
                            }
                        }
                    }
                }
            });
            return criterias;
        },
        setSearchCriteriasToAdvancedSearch : function(){
            this.setSearchCriterias(this.getAdvancedSearchCriterias());
        },
        reset : function(){
            getListRequest = new GetListRequest(1, 20, true, []);
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

	return searchService;
});
