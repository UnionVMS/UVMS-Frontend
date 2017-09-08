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
                pluginListItem.recipient = data.pluginList[0].sendingLogList[i].recipient;
                pluginListItem.plugin = data.pluginList[0].sendingLogList[i].plugin;

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