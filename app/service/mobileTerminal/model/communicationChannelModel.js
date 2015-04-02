angular.module('unionvmsWeb')
    .factory('CommunicationChannel', function() {

        function CommunicationChannel(data){
            this.order = data.order;
            this.endDate = data.endDate;
            this.startDate = data.startDate;
            this.name = data.name;
        }

        CommunicationChannel.prototype.toJson = function(){
            return JSON.stringify({
                order : this.order,
                endDate : this.endDate,
                startDate : this.startDate,
                name: name
            });
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment(this.startDate).format("YYYY-MM-DD");
        };

        CommunicationChannel.prototype.getFormattedEndDate = function() {
            return moment(this.endDate).format("YYYY-MM-DD");
        };

        CommunicationChannel.prototype.getCommunicationChannelName = function(){
            return this.name;
        };

        return CommunicationChannel;
    });
