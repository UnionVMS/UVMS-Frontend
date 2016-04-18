angular.module('unionvmsWeb')
.factory('ExchangeSendingQueue', function(){

    function ExchangeSendingQueue(){
        this.pluginList = {};
        this.pluginList.recipient = undefined;
        this.pluginList.messageType = undefined;
        this.pluginList.lastReceived = undefined;
        this.pluginList.sendingLogList = [];
    }

    ExchangeSendingQueue.fromJson = function(data){

        var exchangeSendingQueue = new ExchangeSendingQueue();
        if(data){
            exchangeSendingQueue.pluginList.recipient = data.recipient;
            exchangeSendingQueue.pluginList.messageType = data.pluginList[0].name;
            exchangeSendingQueue.pluginList.lastReceived = undefined;
            exchangeSendingQueue.pluginList.sortBy = "recipient";
            exchangeSendingQueue.pluginList.sortReverse = false;

            for (var i = data.pluginList[0].sendingLogList.length - 1; i >= 0; i--) {
                var pluginListItem = {};
                pluginListItem.messageId = data.pluginList[0].sendingLogList[i].messageId;
                pluginListItem.dateReceived = data.pluginList[0].sendingLogList[i].dateRecieved;
                pluginListItem.senderRecipient = data.pluginList[0].sendingLogList[i].senderRecipient;

                pluginListItem.POLL_TYPE = undefined;
                pluginListItem.ASSET_NAME = undefined;
                pluginListItem.LONGITUDE = undefined;
                pluginListItem.IRCS = undefined;
                pluginListItem.LATITUDE = undefined;
                pluginListItem.POSITION_TIME = undefined;
                pluginListItem.EMAIL = undefined;
                //pluginListItem.sortBy = "";

                var c = 0;
                for(c in data.pluginList[0].sendingLogList[i].properties) {
                    pluginListItem[c] = data.pluginList[0].sendingLogList[i].properties[c];
                }

                exchangeSendingQueue.pluginList.sendingLogList.push(pluginListItem);
            }
        }

        exchangeSendingQueue.pluginList.sendingLogList = _.sortBy(exchangeSendingQueue.pluginList.sendingLogList, function(dateReceived){return exchangeSendingQueue.pluginList.sendingLogList;});
        exchangeSendingQueue.pluginList.lastReceived = exchangeSendingQueue.pluginList.sendingLogList[0].dateReceived;

        return exchangeSendingQueue;
    };

    return ExchangeSendingQueue;
});

