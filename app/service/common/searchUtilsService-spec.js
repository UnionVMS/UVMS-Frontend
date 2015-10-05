describe('searchUtilsService', function() {

  beforeEach(module('unionvmsWeb'));

    var validateSearchCriterias = function(getListRequest){
        var minPower, maxPower, powerSpan, name, searchCriteriaKey, searchCriteriaValue;
        $.each(getListRequest.criterias, function(index, criteria){
            searchCriteriaKey = criteria.key;
            searchCriteriaValue = criteria.value;
            if(searchCriteriaKey === 'MIN_POWER'){
                minPower = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'MAX_POWER'){
                maxPower = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'POWER_SPAN'){
                powerSpan = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'NAME'){
                name = searchCriteriaValue;
            }
        });
        //Correct values?
        expect(minPower).toEqual('5.5');
        expect(maxPower).toEqual('10.3');
        expect(powerSpan).toEqual(undefined);
        expect(name).toEqual('TEST');
    };

  it('replaceSpansWithMinMaxValues should replace criterias with min and max values', inject(function(searchUtilsService, GetListRequest) {

    var getListRequest = new GetListRequest();
    getListRequest.addSearchCriteria("NAME", "TEST");
    getListRequest.addSearchCriteria("POWER_SPAN", "5.5-10.3");
    getListRequest.addSearchCriteria("LENGTH_SPAN", "32-64");
    getListRequest.addSearchCriteria("SPEED_SPAN", "15.0-30.3");
    expect(getListRequest.criterias.length).toEqual(4);

    searchUtilsService.replaceSpansWithMinMaxValues(getListRequest.criterias);
    expect(getListRequest.criterias.length).toEqual(7);
    validateSearchCriterias(getListRequest);

  }));

  it('modifySpanAndTimeZones should replace criterias with min and max values', inject(function(searchUtilsService, GetListRequest) {

    var getListRequest = new GetListRequest();
    getListRequest.addSearchCriteria("NAME", "TEST");
    getListRequest.addSearchCriteria("POWER_SPAN", "5.5-10.3");
    getListRequest.addSearchCriteria("LENGTH_SPAN", "32-64");
    getListRequest.addSearchCriteria("SPEED_SPAN", "15.0-30.3");
    expect(getListRequest.criterias.length).toEqual(4);

    searchUtilsService.modifySpanAndTimeZones(getListRequest.criterias);
    expect(getListRequest.criterias.length).toEqual(7);
    validateSearchCriterias(getListRequest);
  }));

  it('replaceMinMaxValuesWithSpans should replace min and max values with span criterias', inject(function(searchUtilsService, GetListRequest) {

    var getListRequest = new GetListRequest();
    getListRequest.addSearchCriteria("NAME", "TEST");
    getListRequest.addSearchCriteria("MIN_POWER", "5.5");
    getListRequest.addSearchCriteria("MAX_POWER", "33");
    getListRequest.addSearchCriteria("SPEED_MIN", "15");
    expect(getListRequest.criterias.length).toEqual(4);

    searchUtilsService.replaceMinMaxValuesWithSpans(getListRequest.criterias);
    expect(getListRequest.criterias.length).toEqual(3);

        var minPower, maxPower, powerSpan, speedSpan, name, searchCriteriaKey, searchCriteriaValue;
        $.each(getListRequest.criterias, function(index, criteria){
            searchCriteriaKey = criteria.key;
            searchCriteriaValue = criteria.value;
            if(searchCriteriaKey === 'MIN_POWER'){
                minPower = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'MAX_POWER'){
                maxPower = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'POWER_SPAN'){
                powerSpan = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'NAME'){
                name = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'SPEED_SPAN'){
                speedSpan = searchCriteriaValue;
            }
        });
        //Correct values?
        expect(minPower).toEqual(undefined);
        expect(maxPower).toEqual(undefined);
        expect(powerSpan).toEqual('5.5-33');
        expect(speedSpan).toEqual('15+');
        expect(name).toEqual('TEST');
  }));

});