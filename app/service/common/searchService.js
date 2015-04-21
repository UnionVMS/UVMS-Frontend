angular.module('unionvmsWeb').factory('searchService',function($q, MobileTerminalListPage, GetListRequest, SearchField, vesselRestService, mobileTerminalRestService) {

	var getListRequest = new GetListRequest(1, 10, true, []),
        advancedSearchObject  = {};
	var searchService = {

        //Do the search for vessels
		searchVessels : function(){
			return vesselRestService.getVesselList(getListRequest);
		},
        //Do the search for mobile terminals
        searchMobileTerminals : function(){
            var newSearchCriterias = [],
                vesselSearchCriteria = [];

            //Search keys that belong to vessel
            var vesselSearchKeys = [
                "INTERNAL_ID", 
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
                    if(crit.key === 'INTERNAL_ID'){
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
                if (value.trim().length !== 0){
                    criterias.push(new SearchField(key, value));
                }
            });
            return criterias;
        },
        setSearchCriteriasToAdvancedSearch : function(){
            this.setSearchCriterias(this.getAdvancedSearchCriterias());
        },
        reset : function(){
            getListRequest = new GetListRequest(1, 10, true, []);
            advancedSearchObject = {};
        },
        resetAdvancedSearch : function(){
            advancedSearchObject = {};
        },

	};

	return searchService;
});
