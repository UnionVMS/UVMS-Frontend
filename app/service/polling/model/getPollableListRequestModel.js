angular.module('unionvmsWeb')
.factory('GetPollableListRequest', function() {

    function GetPollableListRequest(page, listSize, connectIds){
        this.page = angular.isDefined(page) ? page : 1;
        this.listSize = angular.isDefined(listSize) ? listSize : 20;
        this.connectIds = angular.isDefined(connectIds) ? connectIds : [];
    }

    GetPollableListRequest.prototype.DTOForPollable = function(){
        return {
            pagination : {page: this.page, listSize: this.listSize},
            connectIdList : this.connectIds
        };
    };

    GetPollableListRequest.prototype.setPage = function(newPage){
        this.page = newPage;
        return this.page;
    };

    GetPollableListRequest.prototype.addConnectId = function(connectId){
            this.connectIds.push(connectId);
    };

    return GetPollableListRequest;
});
