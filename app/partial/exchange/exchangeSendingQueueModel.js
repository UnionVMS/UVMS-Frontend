angular.module('unionvmsWeb')
.factory('ExchangeSendingQueue', function(){

    function ExchangeSendingQueue(){
        this.recipient = undefined;
        this.sendingLogList = undefined;
    }

    ExchangeSendingQueue.fromJson = function(data){
        var exchangeSendingQueue = new ExchangeSendingQueue();

        if(data){
            exchangeSendingQueue.recipient = data.recipient;
            exchangeSendingQueue.sendingLogList = data.LogList;
        }

        return exchangeSendingQueue;
    };

    return ExchangeSendingQueue;

});