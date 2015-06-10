angular.module('unionvmsWeb').factory('searchService',function($q, MobileTerminalListPage, GetListRequest, SearchField, vesselRestService, mobileTerminalRestService, pollingRestService, movementRestService, manualPositionRestService) {

	var getListRequest = new GetListRequest(1, 20, true, []),
        advancedSearchObject  = {};

    var addUTCTimeZone = function(timeToTransform) {
        return moment(timeToTransform).format("YYYY-MM-DD HH:mm:ss Z");
    };

    var checkTimeSpanAndTimeZone = function(searchCriteria){
        var i, idx;
        for (i = 0; i < searchCriteria.length; i++) {
            if(searchCriteria[i].key === "TIME_SPAN"){
                idx = i;
                if(searchCriteria[i].value !== "Custom"){
                        searchCriteria.push(new SearchField("TO_DATE", moment()));
                        searchCriteria.push(new SearchField("FROM_DATE", moment().add('hours', -searchCriteria[i].value)));
                }
            }
        }

        if (angular.isDefined(idx)){
            searchCriteria.splice(idx,1);    
        }
        var dateCriterias = ["END_DATE","START_DATE", "REPORTING_START_DATE", "REPORTING_END_DATE", "TO_DATE", "FROM_DATE" ];
        
        for (i = 0; i < searchCriteria.length; i++) {
            if ( dateCriterias.indexOf(searchCriteria[i].key) >= 0){
                    searchCriteria[i].value = addUTCTimeZone(searchCriteria[i].value);
            }
        }
        
        return searchCriteria;
    };    

	var searchService = {

        //Do the search for vessels
		searchVessels : function(){
			return vesselRestService.getVesselList(getListRequest);
		},

        //Do the search for polls
        searchPolls : function(){
            checkTimeSpanAndTimeZone(getListRequest.criterias);
            return pollingRestService.getPollList(getListRequest);
        },

        //Do search for movements
        searchMovements : function(){
            //intercept request and set utc timezone on dates.
            checkTimeSpanAndTimeZone(getListRequest.criterias);
            return movementRestService.getMovementList(getListRequest);
        },
        //Do search for pollables
        searchForPollableTerminals : function(){
            return mobileTerminalRestService.getPollableTerminals(getListRequest);
        },
        //search for manual positions.
        searchManualPositions : function(){
            return manualPositionRestService.getManualPositionList(getListRequest);
        },

        //Do the search for mobile terminals
        //If skipVesselSearch=true then no search to vessel module is performed 
        // and all serach criterias are sent directly to mobile terminal search
        searchMobileTerminals : function(skipVesselSearch){

            //Get mobile terminals without getting vessels first
            if(skipVesselSearch){
                return mobileTerminalRestService.getMobileTerminalList(getListRequest);
            }


            var newSearchCriterias = [],
                vesselSearchCriteria = [];

            //Search keys that belong to vessel
            var vesselSearchKeys = [
                "GUID", 
                "NAME", 
                "IRCS", 
                "MMSI", 
                "EXTERNAL_MARKING", 
                "CFR", 
                "HOMEPORT", 
                "ACTIVE", 
                "FLAG_STATE", 
                "LICENSE", 
                "TYPE",
            ];

            //Check if there are any search criterias that need vessels to be searched first
            // and remove those search criterias
            var vesselSearchIsDynamic = true;
            $.each(this.getSearchCriterias(),function(index, crit){
                if(_.contains(vesselSearchKeys, crit.key)){
                    if(crit.key === 'GUID'){
                        vesselSearchIsDynamic = false;
                    }
                    vesselSearchCriteria.push(crit);
                }else{
                    newSearchCriterias.push(crit);
                }
            });

            //Set the new search criterias (without vessel criterias)
            this.setSearchCriterias(newSearchCriterias);

            //Get vessels first?
            if(vesselSearchCriteria.length > 0){
                var deferred = $q.defer();
                var getVesselListRequest = new GetListRequest(1, 1000, vesselSearchIsDynamic, vesselSearchCriteria);
                var outerThis = this;
                //Get the vessels
                vesselRestService.getAllMatchingVessels(getVesselListRequest).then(
                    //TODO: Get more pages of vessels or error message that too many vessels were returned?
                    function(vessels){
                        //If no matchin vessels found
                        if(vessels.length === 0){
                            return deferred.resolve(new MobileTerminalListPage());
                        }

                        //Iterate over the vessels to add new search criterias with IRCS as key
                        $.each(vessels, function(index, vessel){
                            outerThis.addSearchCriteria("IRCS", vessel.ircs);
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
        getAdvancedSearchCriterias : function(){
            var criterias = [];
            $.each(advancedSearchObject, function(key, value){
                //Skip empty values
                if (typeof value === 'string' && value.trim().length !== 0){
                    criterias.push(new SearchField(key, value));
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
                delete advancedSearchObject[item];
            }
        },

	};

	return searchService;
});
