angular.module('unionvmsWeb').factory('Ticket', function() {

    function Ticket(){
        this.guid = undefined;
        this.openDate = undefined;
        this.assetId = undefined;
        this.vesselGuid = undefined;
        this.vessel = undefined;
        this.positionGuid = undefined;
        this.ruleName = undefined;
        this.sender = undefined;
        this.recipient = undefined;
        this.updated = undefined;
        this.updatedBy = undefined;
        this.status = undefined;

    }

    Ticket.fromDTO = function(dto){
        var ticket = new Ticket();
        ticket.guid = dto.guid;
        ticket.openDate = dto.openDate;

        ticket.vesselGuid = dto.assetGuid;
        ticket.positionGuid = dto.movementGuid;
        ticket.ruleName = dto.ruleName;
        ticket.sender = dto.sender;
        ticket.recipient = dto.recipient;
        ticket.updated = dto.updated;
        ticket.updatedBy = dto.updatedBy;
        ticket.status = dto.status;
        return ticket;
    };

    Ticket.prototype.setStatusToClosed = function() {
        this.status = "CLOSED";
    };

    Ticket.prototype.isOpen = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "OPEN";
    };

    Ticket.prototype.isPending = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "PENDING";
    };

    Ticket.prototype.isClosed = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "CLOSED";
    };

    Ticket.prototype.setUpdatedBy = function(updatedBy) {
        this.updatedBy = updatedBy;
    };

    //Get resolved date. Return updated date if alarm is closed.
    Ticket.prototype.getResolvedDate = function() {
        if(this.isOpen() || this.isPending()){
            return;
        }
        return this.updated;
    };

    //Get resolvedBy user. Return updatedBy if alarm is closed.
    Ticket.prototype.getResolvedBy = function() {
        if(this.isOpen() || this.isPending()){
            return;
        }
        return this.updatedBy;
    };

    Ticket.prototype.copy = function() {
        var copy = new Ticket();

        copy.guid = this.guid;
        copy.openedDate = this.openedDate;
        copy.vesselGuid = this.vesselGuid;
        copy.positionGuid = this.positionGuid;
        copy.ruleName = this.ruleName;
        copy.sender = this.sender;
        copy.recipient = this.recipient;
        copy.updated = this.updated;
        copy.updatedBy = this.updatedBy;
        copy.status = this.status;

        if(angular.isDefined(this.vessel)){
            copy.vessel = this.vessel.copy();
        }
        return copy;
    };

    //Used for updating status
    Ticket.prototype.DTO = function(){
        var dto = {
            guid : this.guid,
            status: this.status,
        };
        if(this.isClosed()){
            dto.updatedBy = this.updatedBy;
        }
        return dto;
    };

    //Check if the Ticket is equal another Ticket
    //Equal means same guid
    Ticket.prototype.equals = function(item) {
        return this.guid === item.guid;
    };

    return Ticket;
});