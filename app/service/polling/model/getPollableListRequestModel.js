angular.module('unionvmsWeb')
.factory('GetPollableListRequest', function() {

    function GetPollableListRequest(page, listSize, carrierIds){
        this.page = angular.isDefined(page) ? page : 1;
        this.listSize = angular.isDefined(listSize) ? listSize : 20;
        this.carrierIds = angular.isDefined(carrierIds) ? carrierIds : [];
    }

    GetPollableListRequest.prototype.DTOForPollable = function(){
        return {
            pagination : {page: this.page, listSize: this.listSize},
            carrierId : this.carrierIds
        };
    };

    GetPollableListRequest.prototype.setPage = function(newPage){
        this.page = newPage;
        return this.page;
    };

    GetPollableListRequest.prototype.addCarrierId = function(carrierId){
            this.carrierIds.push(carrierId);
    };

    return GetPollableListRequest;
});
