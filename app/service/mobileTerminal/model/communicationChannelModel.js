angular.module('unionvmsWeb')
    .factory('CommunicationChannel', function() {

        //Create a new channel with the default type "VMS"
        function CommunicationChannel(order){
            this.order = order;
            this.channelType = "VMS";
        }

        CommunicationChannel.fromJson = function(data){
            var channel = new CommunicationChannel(data.order);
            channel.channelType = data.channelType;
            channel.memberId = data.memberId;
            channel.dnid = data.dnid;
            channel.startDate = data.startDate;
            channel.stopDate = data.stopDate;
            return channel;
        };

        CommunicationChannel.prototype.toJson = function(){
            return JSON.stringify({
                channelType : angular.isDefined(this.channelType) ? this.channelType : '',
                memberId : angular.isDefined(this.memberId) ? this.memberId : '',
                dnid : angular.isDefined(this.dnid) ? this.dnid : '',
                order : angular.isDefined(this.order) ? this.order : '',
                startDate : angular.isDefined(this.startDate) ? this.startDate : '',
                stopDate : angular.isDefined(this.stopDate) ? this.stopDate : ''
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
