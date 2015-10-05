angular.module('unionvmsWeb').factory('searchUtilsService',function(SearchField) {

    //Add UTC TimeZone to a date string
    var addUTCTimeZone = function(timeToTransform) {
        return moment(timeToTransform).format("YYYY-MM-DD HH:mm:ss Z");
    };

    //Modify span and times zones in list of s
    var modifySpanAndTimeZones = function(searchCriterias){
        searchCriterias = replaceSpansWithMinMaxValues(searchCriterias);

        //Transform dates to UTC dates
        var dateCriterias = ["END_DATE","START_DATE", "REPORTING_START_DATE", "REPORTING_END_DATE", "TO_DATE", "FROM_DATE" ];
        for (var i = 0; i < searchCriterias.length; i++) {
            if ( dateCriterias.indexOf(searchCriterias[i].key) >= 0){
                    searchCriterias[i].value = addUTCTimeZone(searchCriterias[i].value);
            }
        }

        return searchCriterias;
    };

    var numberSpans = {
        'LENGTH_SPAN' : {min : 'MIN_LENGTH', max: 'MAX_LENGTH'},
        'POWER_SPAN'  : {min : 'MIN_POWER',  max: 'MAX_POWER'},
        'SPEED_SPAN'  : {min : 'SPEED_MIN',  max: 'SPEED_MAX'},
    };

    var replaceSpansWithMinMaxValues = function(searchCriterias){
        var i, span, searchCriteriaKey, searchCriteriaValue, idxToRemove = [];

        //Modify search criterias containing spans
        for (i = 0; i < searchCriterias.length; i++) {
            searchCriteriaKey = searchCriterias[i].key;
            searchCriteriaValue = searchCriterias[i].value;

            //Replace TIME_SPAN with TO_DATE and FROM_DATE
            if(searchCriteriaKey === "TIME_SPAN"){
                idxToRemove.push(i);
                if(searchCriterias[i].value.toUpperCase() !== "CUSTOM"){
                    searchCriterias.push(new SearchField("TO_DATE", moment()));
                    searchCriterias.push(new SearchField("FROM_DATE", moment().add('hours', -searchCriteriaValue)));
                }
            }

            //Replace spans with min and max values
            if(searchCriteriaKey in numberSpans){
                idxToRemove.push(i);

                //Split on -
                if(searchCriteriaValue.indexOf("-") > 0){
                    span = searchCriterias[i].value.split("-");
                    searchCriterias.push(new SearchField(numberSpans[searchCriteriaKey].min, span[0]));
                    searchCriterias.push(new SearchField(numberSpans[searchCriteriaKey].max, span[1]));
                }
                //Split on + (and add only min value)
                else if(searchCriteriaValue.indexOf("+") > 0){
                    span = searchCriterias[i].value.split("+");
                    searchCriterias.push(new SearchField(numberSpans[searchCriteriaKey].min, span[0]));
                }
            }
        }

        //Remove span criterias
        for (i = idxToRemove.length - 1; i >= 0; i--) {
            searchCriterias.splice(idxToRemove[i],1);
        }

        return searchCriterias;
    };

    //Replace min and max criterias with span criterias
    var replaceMinMaxValuesWithSpans = function(searchCriterias){
        var i, searchCriteriaKey, searchCriteriaValue, idxToRemove = [];
        //TODO: Handle TIME_SPAN when needed

        //Replace min and max values with spans
        var spanMin, spanMax;
        $.each(numberSpans, function(spanKey, spanValue){
            spanMin = spanMax = undefined;

            //Modify search criterias containing spans
            for (i = 0; i < searchCriterias.length; i++) {
                searchCriteriaKey = searchCriterias[i].key;
                searchCriteriaValue = searchCriterias[i].value;
                if(searchCriteriaKey === spanValue.min){
                    spanMin = searchCriteriaValue;
                    idxToRemove.push(i);
                }
                else if(searchCriteriaKey === spanValue.max){
                    spanMax = searchCriteriaValue;
                    idxToRemove.push(i);
                }
            }
            if(angular.isDefined(spanMin)){
                //Min and max
                if(angular.isDefined(spanMax)){
                    searchCriterias.push(new SearchField(spanKey, spanMin +'-' +spanMax));
                }
                //Only min
                else{
                    searchCriterias.push(new SearchField(spanKey, spanMin +'+'));
                }
            }
        });

        //Remove span criterias
        for (i = idxToRemove.length - 1; i >= 0; i--) {
            searchCriterias.splice(idxToRemove[i],1);
        }

        return searchCriterias;
    };

    var getSearchCriteriaPartition = function(searchCriteria, searchKeysMap) {
        var partition = {"default": []};
        $.each(searchKeysMap, function(label, value) {
            partition[label] = [];
        });

        $.each(searchCriteria, function(index, searchCriterion) {
            var part = partition["default"];
            $.each(searchKeysMap, function(partitionKey, partitionSearchKeys) {
                if (partitionSearchKeys[searchCriterion.key]) {
                    part = partition[partitionKey];
                    return false;
                }
            });

            part.push(searchCriterion);
        });

        return partition;
    };


	var searchUtilsService = {
        modifySpanAndTimeZones : modifySpanAndTimeZones,
        replaceSpansWithMinMaxValues : replaceSpansWithMinMaxValues,
        replaceMinMaxValuesWithSpans : replaceMinMaxValuesWithSpans,
        getSearchCriteriaPartition : getSearchCriteriaPartition,
    };

	return searchUtilsService;
});