angular.module('unionvmsWeb')
.factory('GetListRequest', function(SearchField) {

    function GetListRequest(page, listSize, isDynamic, criterias){
        this.page = angular.isDefined(page) ? page : 1;
        this.listSize = angular.isDefined(listSize) ? listSize : 10;
        this.isDynamic = angular.isDefined(isDynamic) ? isDynamic : true;
        this.criterias = angular.isDefined(criterias) ? criterias : [];
    }

    GetListRequest.prototype.toJson = function(){
        return JSON.stringify({
            pagination : {page: this.page, listSize: this.listSize},
            searchCriteria : {isDynamic: this.isDynamic, criterias: this.criterias}
        });
    };

    GetListRequest.prototype.DTOForVessel = function(){
        //Add * to all text searches for vessel
        var wildcardSearchKeys = ['NAME', 'IRCS', 'CFR', 'EXTERNAL_MARKING', 'MMSI', 'HOMEPORT', 'IMO', 'PRODUCER_NAME', 'PRODUCER_CODE', 'CONTACT_NAME', 'CONTACT_NUMBER', 'CONTACT_EMAIL'];
        var updatedCriterias = [],
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
            updatedCriterias.push(new SearchField(searchFieldKey, searchFieldValue));
        });

        return {
            pagination : {page: this.page, listSize: this.listSize},
            vesselSearchCriteria : { isDynamic : this.isDynamic, criterias : updatedCriterias }
        };
    };

    GetListRequest.prototype.DTOForMobileTerminal = function(){

        return {
            pagination : {page: this.page, listSize: this.listSize},
            mobileTerminalSearchCriteria : {isDynamic: this.isDynamic, criterias: this.criterias}
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
            pagination: {page: this.page, listSize: this.listSize}
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
            pagination: {page: this.page, listSize: this.listSize}
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
        $.each(this.criterias, function(index, searchField){
            copy.criterias.push(searchField.copy());
        });
        return copy;
    };

    return GetListRequest;
});
