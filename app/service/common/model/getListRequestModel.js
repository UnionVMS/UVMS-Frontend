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
        //var crit = checkTimeZone(this.criterias);
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
         return {
            movementSearchCriteria : this.criterias,
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
            exchangeSearchCriteria : this.criterias,
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
