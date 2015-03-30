angular.module('unionvmsWeb') 
.factory('EventHistory', function() {

        function EventHistory(data){
            this.eventCode = data.eventCode;
            this.eventDate = data.eventDate;
            this.eventId = data.eventId;
        }

        EventHistory.prototype.toJson = function(){
            return JSON.stringify({
                eventCode : this.eventCode,
                eventDate : this.eventDate,
                eventId : this.eventId
            });
        };        
 
        EventHistory.prototype.getFormattedEventDate = function() {
            return moment(this.eventDate).format("YYYY-MM-DD");
        };
 
        return EventHistory;
    });