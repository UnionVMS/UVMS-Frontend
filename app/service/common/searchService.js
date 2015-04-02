angular.module('unionvmsWeb').factory('searchService',function(GetListRequest, SearchField, vesselRestService) {

	var getListRequest = new GetListRequest(1, 10, true, []),
        advancedSearchObject  = {};
	var searchService = {

        //Do the search!
		searchVessels : function(){
			return vesselRestService.getVesselList(getListRequest);
		},
        searchMobileTerminals : function(){
            //return mobileTerminalRestService.getVesselList(getListRequest);
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

        /*validate : function(){

        }*/



	};

	return searchService;
});