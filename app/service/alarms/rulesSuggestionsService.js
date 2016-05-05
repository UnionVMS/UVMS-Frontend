//Service that handles the suggestions/dropdowns in the Rules form
angular.module('unionvmsWeb').factory('rulesSuggestionsService',function($log, $q, locale, GetListRequest, vesselRestService, mobileTerminalRestService, spatialConfigRestService, spatialRestService, userService) {
    var maxNumberOfSuggestions = 10;
    var autoSuggestionGetListRequest = new GetListRequest(1, maxNumberOfSuggestions, true, []);

    //Get suggestions from a searchResultPage
    var getSuggestionsFromPage = function(searchResultListPage, criteria, subCriteria){
        var suggestions = searchResultListPage.items.reduce(function(suggestions, resultItem){
            //Get the correct suggestion value
            switch (subCriteria){
                case 'ASSET_NAME':
                    suggestions.push(resultItem.name);
                    break;
                case 'ASSET_CFR':
                    suggestions.push(resultItem.cfr);
                    break;
                case 'ASSET_IRCS':
                    suggestions.push(resultItem.ircs);
                    break;
                case 'EXTERNAL_MARKING':
                    suggestions.push(resultItem.externalMarking);
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
            case 'ASSET_NAME':
                searchKey = 'NAME';
                break;
            case 'ASSET_CFR':
                searchKey = 'CFR';
                break;
            case 'ASSET_IRCS':
                searchKey = 'IRCS';
                break;
            case 'EXTERNAL_MARKING':
                searchKey = 'EXTERNAL_MARKING';
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

    var countryCache = undefined;

    function getCodesWithPrefix(codes, searchValue) {
        var prefix = new RegExp('^' + searchValue, 'gi');
        return codes.filter(function(code) {
            return code.match(prefix) != null;
        });
    }

    function getCountries(searchValue) {
        return $q.when(countryCache || $q(function(resolve) {
            // Reload if cached value is undefined
            return spatialConfigRestService.getCountriesList().then(function(countries) {
                countryCache = Object.keys(countries).sort();
                resolve(countryCache);
            });
        })).then(function(countries) {
            // Filter country codes by the current search value
            return getCodesWithPrefix(countries, searchValue);
        });
    }

    var userAreaCache = undefined;

    function getUserAreas(searchValue) {
        return $q.when(userAreaCache || $q(function(resolve) {
            return spatialRestService.getUserDefinedAreas().then(function(areas) {
                userAreaCache = areas.map(function(area) { return area.name; });
                resolve(userAreaCache);
            });
        })).then(function(userAreas) {
            return getCodesWithPrefix(userAreas, searchValue);
        });
    }

    var getAreaCodes = function(criteria, subCriteria, searchValue, options) {
        var promises = [];

        if (options.countries) {
            promises.push(getCountries(searchValue));
        }

        if (options.userAreas && userService.isAllowed('MANAGE_USER_DEFINED_AREAS', 'Spatial', true)) {
            promises.push(getUserAreas(searchValue));
        }

        return $q.all(promises).then(function(areaCodes) {
            // Join area codes from all sources.
            return Array.prototype.concat.apply([], areaCodes);
        });
    };

    //Is auto suggestions available for the ruleDefinition
    var isSuggestionsAvailable =  function(ruleDefinition){
        return angular.isDefined(getSuggestionsSearchFunction(ruleDefinition));
    };

    //Get the auto suggestion search function
    var getSuggestionsSearchFunction = function(ruleDefinition){
        switch(ruleDefinition.subCriteria){
            case 'ASSET_NAME':
            case 'ASSET_CFR':
            case 'ASSET_IRCS':
            case 'EXTERNAL_MARKING':
                return getVessels;
            case 'MT_DNID':
            case 'MT_MEMBER_ID':
            case 'MT_SERIAL_NO':
                return getMobileTerminals;
            case 'AREA_CODE':
            case 'AREA_CODE_ENT':
            case 'AREA_CODE_EXT':
                return getAreaCodes;
            default:
                return;
        }
    };

	var rulesSuggestionsService = {
        //Is auto suggestions available for the ruleDefinition
        isSuggestionsAvailable : isSuggestionsAvailable,
        //Get suggestions
        getSuggestions : function(searchValue, ruleDefinition, options){
            var deferred = $q.defer();
            if(isSuggestionsAvailable(ruleDefinition)){
                $log.debug("Get suggestions for:" +searchValue);
                $log.debug(ruleDefinition);
                //Reset serach criterias
                autoSuggestionGetListRequest.resetCriterias();

                $log.debug("Current criteria:" +ruleDefinition.criteria);
                $log.debug("Current subCriteria:" +ruleDefinition.subCriteria);
                var searchFunc = getSuggestionsSearchFunction(ruleDefinition);

                //Is there a searchFunc defined?
                if(angular.isDefined(searchFunc)){
                    searchFunc(ruleDefinition.criteria, ruleDefinition.subCriteria, searchValue, options).then(
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
        }
    };

	return rulesSuggestionsService;
});