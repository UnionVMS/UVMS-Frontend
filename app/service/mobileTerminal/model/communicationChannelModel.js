angular.module('unionvmsWeb')
    .factory('CommunicationChannel', function() {

        //Create a new channel with the default type "VMS"
        function CommunicationChannel(order){
            this.order = order;
            this.channelType = "VMS";
            this.ids = {};
        }

        CommunicationChannel.fromJson = function(data){
            var channel = new CommunicationChannel(data.order);
            channel.channelType = data.channelType;
            channel.startDate = data.startDate;
            channel.stopDate = data.stopDate;

            //IdList
            for (var i = 0; i < data.idList.length; i ++) {
                var idType = data.idList[i].type,
                    idValue = data.idList[i].value;
                channel.ids[idType] = idValue;
            } 

            return channel;
        };

        CommunicationChannel.prototype.toJson = function(){
            //Create idList
            var idList = [];
            $.each(this.ids, function(key, value){
                idList.push({"type": key, "value": value});
            });

            return JSON.stringify({
                channelType : angular.isDefined(this.channelType) ? this.channelType : '',
                order : angular.isDefined(this.order) ? this.order : '',
                startDate : angular.isDefined(this.startDate) ? this.startDate : '',
                stopDate : angular.isDefined(this.stopDate) ? this.stopDate : '',
                idList : idList
            });
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment.utc(this.startDate, 'X').format("YYYY-MM-DD");
        };

        CommunicationChannel.prototype.getFormattedStopDate = function() {
            return moment.utc(this.stopDate, 'X').format("YYYY-MM-DD");
        };

        return CommunicationChannel;
    });
