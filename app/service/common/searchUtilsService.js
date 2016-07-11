/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('searchUtilsService',function(SearchField, dateTimeService, locale) {

    //Modify span and times zones in list of search criterias
    var modifySpanAndTimeZones = function(searchCriterias){
        searchCriterias = replaceSpansWithMinMaxValues(searchCriterias);

        //Transform dates to UTC dates
        var dateCriterias = ["END_DATE","START_DATE", "REPORTING_START_DATE", "REPORTING_END_DATE", "TO_DATE", "FROM_DATE", "DATE_RECEIVED_FROM", "DATE_RECEIVED_TO" ];
        for (var i = 0; i < searchCriterias.length; i++) {
            if ( dateCriterias.indexOf(searchCriterias[i].key) >= 0){
                    //Values is already in UTC but we need to format it with timezone
                    searchCriterias[i].value = dateTimeService.formatUTCDateWithTimezone(searchCriterias[i].value);
            }
        }

        return searchCriterias;
    };

    var numberSpans = {
        'LENGTH_SPAN' : {min : 'MIN_LENGTH', max: 'MAX_LENGTH'},
        'POWER_SPAN'  : {min : 'MIN_POWER',  max: 'MAX_POWER'},
        'SPEED_SPAN'  : {min : 'SPEED_MIN',  max: 'SPEED_MAX'}
    };

    var timeSpans = {
        'TIME_SPAN' : {from : 'FROM_DATE', to: 'TO_DATE'},
        'EXCHANGE_TIME_SPAN'  : {from : 'DATE_RECEIVED_FROM',  to: 'DATE_RECEIVED_TO'}
    };

    var replaceSpansWithMinMaxValues = function(searchCriterias){
        var i, span, searchCriteriaKey, searchCriteriaValue, idxToRemove = [];

        //Modify search criterias containing spans
        for (i = 0; i < searchCriterias.length; i++) {
            searchCriteriaKey = searchCriterias[i].key;
            searchCriteriaValue = searchCriterias[i].value;

            //Replace TIME_SPAN with TO_DATE and FROM_DATE
            if(searchCriteriaKey in timeSpans){
                idxToRemove.push(i);
                var fromDateKey = timeSpans[searchCriteriaKey].from;
                var toDateKey = timeSpans[searchCriteriaKey].to;
                switch(searchCriterias[i].value){
                    case 'TODAY':
                        searchCriterias.push(new SearchField(fromDateKey, dateTimeService.formatUTCDateWithTimezone(moment().startOf('day').format("YYYY-MM-DD HH:mm"))));
                        searchCriterias.push(new SearchField(toDateKey, dateTimeService.formatUTCDateWithTimezone(moment.utc().format())));
                        break;
                    case 'THIS_WEEK':
                        searchCriterias.push(new SearchField(fromDateKey, dateTimeService.formatUTCDateWithTimezone(moment().startOf('week').format("YYYY-MM-DD HH:mm"))));
                        searchCriterias.push(new SearchField(toDateKey, dateTimeService.formatUTCDateWithTimezone(moment.utc().format())));
                        break;
                    case 'LAST_MONTH':
                        searchCriterias.push(new SearchField(fromDateKey, dateTimeService.formatUTCDateWithTimezone(moment().startOf('month').format("YYYY-MM-DD HH:mm"))));
                        searchCriterias.push(new SearchField(toDateKey, dateTimeService.formatUTCDateWithTimezone(moment.utc().format())));
                        break;
                    default:
                        break;
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

    var replaceCommasWithPoint = function(searchCriterias){
        for (var i = searchCriterias.length - 1; i >= 0; i--) {
            if(searchCriterias[i].key === "MAX_LENGTH" || searchCriterias[i].key === "MIN_LENGTH")
            {
               searchCriterias[i].value = searchCriterias[i].value.replace(",", ".");
            }
        }
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

    var getTimeSpanOptions = function() {
        var options = [
            {text: locale.getString('common.time_span_today'), code:'TODAY'},
            {text: locale.getString('common.time_span_this_week'), code:'THIS_WEEK'},
            {text: locale.getString('common.time_span_last_month'), code:'LAST_MONTH'},
            {text: locale.getString('common.time_span_custom'), code:'CUSTOM'},
        ];

        return options;
    };

    var getTimeSpanCodeForToday = function() {
        return 'TODAY';
    };

    var getTimeSpanCodeForCustom = function() {
        return 'CUSTOM';
    };

	var searchUtilsService = {
        modifySpanAndTimeZones : modifySpanAndTimeZones,
        replaceSpansWithMinMaxValues : replaceSpansWithMinMaxValues,
        replaceMinMaxValuesWithSpans : replaceMinMaxValuesWithSpans,
        replaceCommasWithPoint : replaceCommasWithPoint,
        getSearchCriteriaPartition : getSearchCriteriaPartition,
        getTimeSpanOptions : getTimeSpanOptions,
        getTimeSpanCodeForToday : getTimeSpanCodeForToday,
        getTimeSpanCodeForCustom : getTimeSpanCodeForCustom
    };

	return searchUtilsService;
});