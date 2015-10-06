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
        return {
            pagination : {page: this.page, listSize: this.listSize},
            vesselSearchCriteria : { isDynamic : this.isDynamic, criterias : this.criterias }
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
        var rangeKeys = {
            FROM_DATE : {key: 'DATE', subKey: 'from'},
            TO_DATE : {key: 'DATE', subKey: 'to'},
            SPEED_MIN : {key: 'MOVEMENT_SPEED', subKey: 'from'},
            SPEED_MAX : {key: 'MOVEMENT_SPEED', subKey: 'to'},
        };

        var rangeCriterias = {};
        var criterias = [];

        //Build dict with rangeCriterias
        var searchFieldKey, searchFieldValue;
        $.each(this.criterias, function(index, searchField){
            searchFieldKey = searchField.key;
            searchFieldValue = searchField.value;
            //Range search?
            if(searchFieldKey in rangeKeys){
                var rangeKey = rangeKeys[searchFieldKey];
                if(angular.isUndefined(rangeCriterias[rangeKey.key])){
                    rangeCriterias[rangeKey.key] = {};
                }
                rangeCriterias[rangeKey.key][rangeKey.subKey] = searchFieldValue;
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


    return GetListRequest;
});
