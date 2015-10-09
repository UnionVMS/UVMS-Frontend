angular.module('unionvmsWeb').factory('Alarm', function() {

    function Alarm(){
        this.guid = undefined;
        this.openedDate = undefined;
        this.affectedObject = undefined;
        this.ruleName = undefined;
        this.sender = undefined;
        this.resolvedDate = undefined;
        this.resolvedBy = undefined;
        this.status = undefined;
    }

    Alarm.fromDTO = function(dto){
        var alarm = new Alarm();
        alarm.guid = dto.guid;
        alarm.openedDate = dto.openDate;
        alarm.affectedObject = dto.affectedObject;
        alarm.ruleName = dto.ruleTriggered;
        alarm.sender = dto.sender;
        alarm.resolvedDate = dto.resolveDate;
        alarm.resolvedBy = dto.resolvedBy;
        alarm.status = dto.status;
        return alarm;
    };

    Alarm.prototype.setStatusToClosed = function() {
        this.status = "CLOSED";
    };

    Alarm.prototype.setStatusToOpen = function() {
        this.status = "OPEN";
    };

    Alarm.prototype.isOpen = function() {
        return this.status.toUpperCase() === "OPEN";
    };

    Alarm.prototype.isClosed = function() {
        return this.status.toUpperCase() === "CLOSED";
    };

    Alarm.prototype.copy = function() {
        var copy = new Alarm();

        copy.guid = this.guid;
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
    //Equal means same guid
    Alarm.prototype.equals = function(item) {
        return this.guid === item.guid;
    };

    return Alarm;
});