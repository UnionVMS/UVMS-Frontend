//Service that handles the suggestions/dropdowns in the Rules form
angular.module('unionvmsWeb').factory('rulesSuggestionsService',function($log, $q, locale, GetListRequest, vesselRestService, mobileTerminalRestService) {
    var maxNumberOfSuggestions = 10;
    var autoSuggestionGetListRequest = new GetListRequest(1, maxNumberOfSuggestions, true, []);

    //List of the subCriterias that supports auto suggestions
    var subCriteriasWithSuggestions = [
        //TODO: Enable mobilTerminal fields when it's possible to search with * in MobilTerminal module
        //'MT_DNID', 'MT_MEMBER_ID', 'MT_SERIAL_NO',
        'VESSEL_NAME', 'VESSEL_CFR', 'VESSEL_IRCS',
    ];

    //Get suggestions from a searchResultPage
    var getSuggestionsFromPage = function(searchResultListPage, criteria, subCriteria){
        var suggestions = searchResultListPage.items.reduce(function(suggestions, resultItem){
            //Get the correct suggestion value
            switch (subCriteria){
                case 'VESSEL_NAME':
                    suggestions.push(resultItem.name);
                    break;
                case 'VESSEL_CFR':
                    suggestions.push(resultItem.cfr);
                    break;
                case 'VESSEL_IRCS':
                    suggestions.push(resultItem.ircs);
                    break;
                case 'MT_DNID':
                    $.each(resultItem.channels, function(i, channel){
                        suggestions.push(channel.ids.DNID);
                    });
                    break;
                case 'MT_MEMBER_ID':
                    $.each(resultItem.channels, function(i, channel){
                        suggestions.push(channel.ids.MEMBER_NUMBER);
                    });
                    break;
                case 'MT_SERIAL_NO':
                    suggestions.push(resultItem.attributes.SERIAL_NUMBER);
                    break;
                default:
                    break;
            }

            return suggestions;
        }, []);

        //Remove duplicates and sort
        suggestions = _.uniq(suggestions);
        suggestions.sort();
        return suggestions;
    };

    //Get search results and then get suggestions from the results
    var getSearchResultPageAndExtractSuggestions = function(pagePromise, criteria, subCriteria){
        var deferred = $q.defer();
        pagePromise.then(
            function(vesselResultListPage){
                var suggestions = getSuggestionsFromPage(vesselResultListPage, criteria, subCriteria);
                deferred.resolve(suggestions);
            },
            function(err){
                deferred.reject(err);
            }
        );
        return deferred.promise;
    };

    //Get vessels matching search query
    var getVessels = function(criteria, subCriteria, searchValue) {
        //Add search critiera
        var searchKey;
        switch(subCriteria){
            case 'VESSEL_NAME':
                searchKey = 'NAME';
                break;
            case 'VESSEL_CFR':
                searchKey = 'CFR';
                break;
            case 'VESSEL_IRCS':
                searchKey = 'IRCS';
                break;
            default:
                $log.warn("Unknown searchKey to use when searching for vessels.");
                return;
        }
        autoSuggestionGetListRequest.addSearchCriteria(searchKey, searchValue +"*");
        var pagePromise = vesselRestService.getVesselList(autoSuggestionGetListRequest);
        return getSearchResultPageAndExtractSuggestions(pagePromise, criteria, subCriteria);
    };

    //Get mobileTerminals matching search query
    var getMobileTerminals = function(criteria, subCriteria, searchValue) {
        //Add search critiera
        var searchKey;
        switch(subCriteria){
            case 'MT_DNID':
                searchKey = 'DNID';
                break;
            case 'MT_MEMBER_ID':
                searchKey = 'MEMBER_NUMBER';
                break;
            case 'MT_SERIAL_NO':
                searchKey = 'SERIAL_NUMBER';
                break;
            default:
                $log.warn("Unknown searchKey to use when searching for mobile terminals.");
                return;
        }
        autoSuggestionGetListRequest.addSearchCriteria(searchKey, searchValue +"*");
        var pagePromise = mobileTerminalRestService.getMobileTerminalList(autoSuggestionGetListRequest);
        return getSearchResultPageAndExtractSuggestions(pagePromise, criteria, subCriteria);
    };

    //Is auto suggestions available for the ruleDefinition
    var isSuggestionsAvailable =  function(ruleDefinition){
        return subCriteriasWithSuggestions.indexOf(ruleDefinition.subCriteria) >= 0;
    };

	var rulesSuggestionsService = {
        //Is auto suggestions available for the ruleDefinition
        isSuggestionsAvailable : isSuggestionsAvailable,
        //Get suggestions
        getSuggestions : function(searchValue, ruleDefinition){
            var deferred = $q.defer();
            if(isSuggestionsAvailable(ruleDefinition)){
                $log.debug("Get suggestions for:" +searchValue);
                $log.debug(ruleDefinition);
                //Reset serach criterias
                autoSuggestionGetListRequest.resetCriterias();

                var searchFunc;
                $log.debug("Current criteria:" +ruleDefinition.criteria);
                $log.debug("Current subCriteria:" +ruleDefinition.subCriteria);
                switch(ruleDefinition.subCriteria){
                    case 'VESSEL_NAME':
                    case 'VESSEL_CFR':
                    case 'VESSEL_IRCS':
                        searchFunc = getVessels;
                        break;
                    case 'MT_DNID':
                    case 'MT_MEMBER_ID':
                    case 'MT_SERIAL_NO':
                        searchFunc = getMobileTerminals;
                        break;
                    default:
                        break;
                }

                //Is there a searchFunc defined?
                if(angular.isDefined(searchFunc)){
                    searchFunc(ruleDefinition.criteria, ruleDefinition.subCriteria, searchValue).then(
                        function(suggestions){
                            deferred.resolve(suggestions);
                        }, function(err){
                            $log.error("Failed to get auto suggestions", err);
                            deferred.reject([]);
                        }
                    );
                }else{
                    //No searchFunc
                    $log.warn("No search func defined. Return []");
                    deferred.resolve([]);
                }
            }
            return deferred.promise;
        },
    };

	return rulesSuggestionsService;
});