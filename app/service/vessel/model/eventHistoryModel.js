angular.module('unionvmsWeb') 
.factory('EventHistory', function() {

        function EventHistory(){
            this.eventCode = undefined;
            this.eventDate = undefined;
            this.eventId = undefined;
        } 

        EventHistory.fromDTO = function(data){
            var eventHistory = new EventHistory();
            eventHistory.eventCode = data.eventCode;
            eventHistory.eventDate = data.eventDate;
            eventHistory.eventId = data.eventId;
            return eventHistory;
        };
 
        EventHistory.prototype.getFormattedEventDate = function() {
            return moment(this.eventDate).format("YYYY-MM-DD");
        };
 
        EventHistory.prototype.copy = function() {
            var copy = new EventHistory();
            copy.eventCode = this.eventCode;
            copy.eventDate = this.eventDate;
            copy.eventId = this.eventId;
            return copy;
        };

        return EventHistory;
    });