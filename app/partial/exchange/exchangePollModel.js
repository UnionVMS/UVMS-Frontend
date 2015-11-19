angular.module('unionvmsWeb').factory('ExchangePoll', function(PollStatus) {

    function ExchangePoll(){
        this.guid = undefined;
        this.pollGuid = undefined;
        this.history = [];
    }

    ExchangePoll.fromDTO = function(dto){
        var exchangePoll = new ExchangePoll();
        exchangePoll.guid = dto.guid;
        if(angular.isDefined(dto.typeRef)){
            exchangePoll.pollGuid = dto.typeRef.refGuid;
        }

        if(angular.isDefined(dto.history)){
            for (var i = 0; i < dto.history.length; i++) {
                exchangePoll.history.push(PollStatus.fromDTO(dto.history[i]));
            }
        }

        return exchangePoll;
    };

    return ExchangePoll;
});

