angular.module('unionvmsWeb').factory('Alarm', function() {

    function Alarm(){
        this.id = undefined;
        this.openedDate = undefined;
        this.affectedObject = undefined;
        this.ruleName = undefined;
        this.sender = undefined;
        this.resolvedDate = undefined;
        this.resolvedBy = undefined;
        this.status = undefined;            
    }


    Alarm.fromJson = function(data){
        //TODO: Implement this
    };

    Alarm.prototype.DTO = function(){
        //TODO: Implement this
        return {};
    };

    Alarm.prototype.setStatusToClosed = function() {
        this.status = "CLOSED";
    };

    Alarm.prototype.setStatusToOpen = function() {
        this.status = "OPEN";
    };

    Alarm.prototype.isOpen = function() {
        return this.status === "OPEN";
    };

    Alarm.prototype.copy = function() {
        var copy = new Alarm();

        copy.id = this.id;
        copy.openedDate = this.openedDate;
        copy.affectedObject = this.affectedObject;
        copy.ruleName = this.ruleName;
        copy.sender = this.sender;
        copy.resolvedDate = this.resolvedDate;
        copy.resolvedBy = this.resolvedBy;
        copy.status = this.status;
        return copy;
    };

    //Check if the Alarm is equal another Alarm
    //Equal means same id
    Alarm.prototype.equals = function(item) {
        return this.id === item.id;
    };

    return Alarm;
});
