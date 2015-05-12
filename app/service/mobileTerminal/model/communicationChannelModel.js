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
            if(angular.isArray(data.attributes)){
                for (var i = 0; i < data.attributes.length; i ++) {
                    var idType = data.attributes[i].type,
                        idValue = data.attributes[i].value;
                    channel.ids[idType] = idValue;
                } 
            }

            return channel;
        };

        CommunicationChannel.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        CommunicationChannel.prototype.dataTransferObject = function() {
            //Create idList
            var idList = [];
            $.each(this.ids, function(key, value){
                idList.push({"type": key, "value": value});
            });

            return {
                channelType : angular.isDefined(this.channelType) ? this.channelType : '',
                order : angular.isDefined(this.order) ? this.order : '',
                attributes : idList
            };
        };

        CommunicationChannel.prototype.copy = function() {
            var copy = new CommunicationChannel();
            copy.order = this.order;
            copy.startDate = this.startDate;
            copy.stopDate = this.stopDate;
            copy.channelType = this.channelType;
            for (var key in this.ids) {
                if (this.ids.hasOwnProperty(key)) {
                    copy.ids[key] = this.ids[key];
                }
            }

            return copy;
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment.utc(this.ids["START_DATE"], 'X').format("YYYY-MM-DD");
        };

        CommunicationChannel.prototype.getFormattedStopDate = function() {
            return moment.utc(this.ids["STOP_DATE"], 'X').format("YYYY-MM-DD");
        };

        return CommunicationChannel;
    });
