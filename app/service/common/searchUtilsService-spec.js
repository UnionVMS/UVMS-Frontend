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

  it('getTimeSpanOptions should return list that includes CUSTOM and TODAY', inject(function(searchUtilsService) {
    var options = searchUtilsService.getTimeSpanOptions();
    var todayFound = false;
    var customFound = false;

    var today = searchUtilsService.getTimeSpanCodeForToday();
    var custom = searchUtilsService.getTimeSpanCodeForCustom();

    expect(options.length).toBeGreaterThan(1); //at least CUSTOM and TODAY
    $.each(options, function(i, option){
        if(option.code === today){
            todayFound = true;
        }
        if(option.code === custom){
            customFound = true;
        }
    });

    expect(todayFound).toBeTruthy('TODAY option should exist in options');
    expect(customFound).toBeTruthy('CUSTOM option should exist in options');
  }));

  it('getSearchCriteriaPartition should split criterias into multiple criteria objects', inject(function(searchUtilsService, SearchField) {

        var criterias = [];
        criterias.push(new SearchField('NAME', 'John Smith'));
        criterias.push(new SearchField('VERSION', '2.9'));
        criterias.push(new SearchField('YEAR', '1994'));
        criterias.push(new SearchField('AGE', '34'));

        var vesselSearchKeys = {
            'NAME' : true,
            'LENGTH' : true,
        };

        var monkeySearchKeys = {
            'AGE' : true,
        };

        var partitions = searchUtilsService.getSearchCriteriaPartition(criterias, {vessel: vesselSearchKeys, monkey: monkeySearchKeys});
        var defaultCriterias = partitions["default"];
        var vesselCriteria = partitions["vessel"];
        var monkeyCriterias = partitions["monkey"];
        expect(defaultCriterias.length).toEqual(2);
        expect(vesselCriteria.length).toEqual(1);
        expect(monkeyCriterias.length).toEqual(1);
  }));
});