/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb')
.factory('GetListRequest', function(SearchField) {

    function GetListRequest(page, listSize, isDynamic, criterias, sorting){
        this.page = angular.isDefined(page) ? page : 1;
        this.listSize = angular.isDefined(listSize) ? listSize : 10;
        this.isDynamic = angular.isDefined(isDynamic) ? isDynamic : true;
        this.criterias = angular.isDefined(criterias) ? criterias : [];
        this.sorting = angular.isDefined(sorting) ? sorting : {};
    }

    GetListRequest.prototype.toJson = function(){
        return JSON.stringify({
            pagination : {page: this.page, listSize: this.listSize},
            searchCriteria : {isDynamic: this.isDynamic, criterias: this.criterias},
            sorting : {sortBy: this.sorting.sortBy, reversed: this.sorting.reverse}
        });
    };

    GetListRequest.prototype.DTOForVessel = function(){
        //Add * to all text searches for vessel
        var wildcardSearchKeys = ['NAME', 'IRCS', 'CFR', 'EXTERNAL_MARKING', 'HOMEPORT', 'IMO', 'PRODUCER_NAME', 'PRODUCER_CODE', 'CONTACT_NAME', 'CONTACT_NUMBER', 'CONTACT_EMAIL', 'MMSI'];
        var updatedCriterias = {},
            searchFieldKey, searchFieldValue;

        $.each(this.criterias, function(index, searchField){
            searchFieldKey = searchField.key;
            searchFieldValue = searchField.value;
            //Add * to the end of the search value?
            if(wildcardSearchKeys.indexOf(searchFieldKey) >= 0){
                if(typeof searchFieldValue === 'string' && searchFieldValue.charAt(searchFieldValue.length -1)){
                    searchFieldValue = searchFieldValue +'*';
                }

            }
//            updatedCriterias.push(new SearchField(searchFieldKey, searchFieldValue));
            if (searchFieldValue) {
            	if (!(searchFieldKey in updatedCriterias)) {
            		updatedCriterias[searchFieldKey] = [];
            	}
            	updatedCriterias[searchFieldKey].push(searchFieldValue);
            }
        });

//        return {
//            pagination : {page: this.page, listSize: this.listSize},
//            assetSearchCriteria : { isDynamic : this.isDynamic, criterias : updatedCriterias }
//        };
        return {
        	id : updatedCriterias['GUID'],
        	historyId : updatedCriterias['HIST_GUID'],
        	cfr : updatedCriterias['CFR'],
        	ircs : updatedCriterias['IRCS'],
        	mmsi : updatedCriterias['MMSI'],
        	name : updatedCriterias['NAME'],
        	flagState : updatedCriterias['FLAG_STATE'],
        	externalMarking : updatedCriterias['EXTERNAL_MARKING'],
        	portOfRegistration : updatedCriterias['HOMEPORT'],
        	gearType : updatedCriterias['GEAR_TYPE'] ? updatedCriterias['GEAR_TYPE'][0] : undefined,
        	minLength : updatedCriterias['MIN_LENGTH'] ? updatedCriterias['MIN_LENGTH'][0] : undefined,
        	maxLength : updatedCriterias['MAX_LENGTH'] ? updatedCriterias['MAX_LENGTH'][0] : undefined,
        	minPower : updatedCriterias['MIN_POWER'] ? updatedCriterias['MIN_POWER'][0] : undefined,
        	maxPower : updatedCriterias['MAX_POWER'] ? updatedCriterias['MAX_POWER'][0] : undefined
        };
    };

    GetListRequest.prototype.DTOForMobileTerminal = function(){
        var wildcardKeys = ['NAME', 'IRCS', 'EXTERNAL_MARKING', 'CFR', 'HOMEPORT', 'MMSI', 'SERIAL_NUMBER', 'DNID', 'SATELLITE_NUMBER', 'MEMBER_NUMBER'];
        var criteria = this.criterias.map(function(criteria) {
            if (wildcardKeys.indexOf(criteria.key) >= 0) {
                return new SearchField(criteria.key, '*' + criteria.value);
            }
            else {
                return criteria;
            }
        });

        return {
            pagination : {page: this.page, listSize: this.listSize},
            mobileTerminalSearchCriteria : {isDynamic: this.isDynamic, criterias: criteria}
        };
    };

    GetListRequest.prototype.DTOForPoll = function(){
        return {
            pagination : {page: this.page, listSize: this.listSize},
            pollSearchCriteria : {isDynamic: this.isDynamic, criterias: this.criterias}
        };
    };

    GetListRequest.prototype.DTOForMovement = function(){

        //List of search fields that should be in the movementRangeSearchCriteria object
        //Ranges must include both from and to, so that's what the defaultValues are for
        var ranges = [
            {
                key : 'DATE',
                from : {searchKey: 'FROM_DATE', defaultValue: '1970-01-01 00:00:00 +00:00'},
                to : {searchKey: 'TO_DATE', defaultValue: '2070-01-01 00:00:00 +00:00'}
            },
            {
                key: 'MOVEMENT_SPEED',
                from : {searchKey: 'SPEED_MIN', defaultValue: 0},
                to : {searchKey: 'SPEED_MAX', defaultValue: 99999999}
            }
        ];

        //Get a range by the search key
        function getRangeBySearchKey(key){
            var range;
            $.each(ranges, function(i, aRange){
                if(key === aRange.from.searchKey || key === aRange.to.searchKey){
                    range = aRange;
                    return false;
                }
            });
            return range;
        }

        var rangeCriterias = {};
        var criterias = [];

        //Build dict with rangeCriterias
        var searchFieldKey, searchFieldValue, range;
        $.each(this.criterias, function(index, searchField){
            searchFieldKey = searchField.key;
            searchFieldValue = searchField.value;

            //Range search?
            range = getRangeBySearchKey(searchFieldKey);
            if(range){
                if(angular.isUndefined(rangeCriterias[range.key])){
                    rangeCriterias[range.key] = {
                        from : range.from.defaultValue,
                        to : range.to.defaultValue,
                    };
                }
                if(searchFieldKey === range.from.searchKey){
                    rangeCriterias[range.key]['from'] = searchFieldValue;
                }
                else{
                    rangeCriterias[range.key]['to'] = searchFieldValue;
                }
            }else{
                criterias.push(searchField);
            }
        });

        //Make rangeCriterias a list
        var rangeCriteriasList = [];
        $.each(rangeCriterias, function(key, value){
            value['key'] = key;
            rangeCriteriasList.push(value);
        });

         return {
            movementRangeSearchCriteria : rangeCriteriasList,
            movementSearchCriteria : criterias,
            pagination : {page: this.page, listSize: this.listSize}
        };
    };

    GetListRequest.prototype.DTOForManualPosition = function(){
         return {
            movementSearchCriteria : this.criterias,
            pagination : {page: this.page, listSize: this.listSize}
        };
    };

    GetListRequest.prototype.DTOForAuditLogList = function() {
        return {
            auditSearchCriteria: this.criterias,
            pagination: {page: this.page, listSize: this.listSize}
        };
    };

    GetListRequest.prototype.DTOForExchangeMessageList = function(){
        return{
            exchangeSearchCriteria : {criterias: this.criterias, isDynamic: false},
            pagination: {page: this.page, listSize: this.listSize},
            sorting: this.sorting
        };
    };

    GetListRequest.prototype.DTOForExchangePollList = function(){
        var fromDateSearchField = this.getCriteria('FROM_DATE');
        var toDateSearchField = this.getCriteria('TO_DATE');
        var statusSearchField = this.getCriteria('STATUS');

        var searchObj = {};
        if(fromDateSearchField){
            searchObj.statusFromDate = fromDateSearchField.value;
        }
        if(toDateSearchField){
            searchObj.statusToDate = toDateSearchField.value;
        }
        if(statusSearchField){
            searchObj.status = statusSearchField.value;
        }
        return searchObj;
    };


    GetListRequest.prototype.DTOForAlarms = function(){
        return{
            alarmSearchCriteria : this.criterias,
            pagination: {page: this.page, listSize: this.listSize},
            isDynamic: this.isDynamic
        };
    };

    GetListRequest.prototype.DTOForTickets = function(){
        return{
            ticketSearchCriteria : this.criterias,
            pagination: {page: this.page, listSize: this.listSize}
        };
    };

    GetListRequest.prototype.DTOForRules = function(){
        return{
            customRuleSearchCriteria : this.criterias,
            pagination: {page: this.page, listSize: this.listSize}
        };
    };

    GetListRequest.prototype.setPage = function(newPage){
        this.page = newPage;
        return this.page;
    };

    GetListRequest.prototype.addSearchCriteria = function(key, value){
        var alreadyExists = false;

        //Only add if it doesnt already exists
        $.each(this.criterias, function(index, crit){
            if(key === crit.key && value === crit.value){
                alreadyExists = true;
                return false;
            }
        });
        if(!alreadyExists){
            this.criterias.push(new SearchField(key, value));
        }
    };

    //Removes criterias with the specified key
    GetListRequest.prototype.removeSearchCriteria = function(key){
        var idxToRemove = [];
        $.each(this.criterias, function(index, crit){
            if(key === crit.key){
                idxToRemove.push(index);
            }
        });

        //Remove criterias
        for (var i = idxToRemove.length - 1; i >= 0; i--) {
            this.criterias.splice(idxToRemove[i],1);
        }
    };

    GetListRequest.prototype.getCriteria = function(criteria){
        var found;
        $.each(this.criterias, function(i, searchField){
            if(searchField.key === criteria){
                found = searchField;
                return false;
            }
        });
        return found;
    };

    GetListRequest.prototype.setSearchCriterias = function(criterias){
        this.criterias = criterias;
    };

    GetListRequest.prototype.resetCriterias = function(){
        this.criterias = [];
    };

    GetListRequest.prototype.setDynamic = function(dynamic){
        this.isDynamic = dynamic;
    };

    GetListRequest.prototype.setDynamicToFalse = function(){
        this.isDynamic = false;
    };

    GetListRequest.prototype.setDynamicToTrue = function(){
        this.isDynamic = true;
    };

    GetListRequest.prototype.getNumberOfSearchCriterias = function(){
        return this.criterias.length;
    };

    GetListRequest.prototype.copy = function(){
        var copy = new GetListRequest();
        copy.page = this.page;
        copy.listSize = this.listSize;
        copy.isDynamic = this.isDynamic;
        copy.criterias = [];
        copy.sorting = this.sorting;

        $.each(this.criterias, function(index, searchField){
            copy.criterias.push(searchField.copy());
        });
        return copy;
    };

    return GetListRequest;
});
