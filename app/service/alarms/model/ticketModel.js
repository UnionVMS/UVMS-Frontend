angular.module('unionvmsWeb').factory('Ticket', function() {

    function Ticket(){
        this.guid = undefined;
        this.openedDate = undefined;
        this.assetId = undefined;
        this.vessel = undefined;
        this.ruleName = undefined;
        this.sender = undefined;
        this.resolvedDate = undefined;
        this.resolvedBy = undefined;
        this.status = undefined;
    }

    Ticket.fromDTO = function(dto){
        var ticket = new Ticket();
        ticket.guid = dto.guid;
        ticket.openedDate = dto.openDate;

        if(angular.isDefined(dto.assetId)){
            ticket.assetId = {
                type : dto.assetId.type,
                value : dto.assetId.value
            };
        }

        ticket.ruleName = dto.ruleName;
        ticket.sender = dto.sender;
        ticket.resolvedDate = dto.resolveDate;
        ticket.resolvedBy = dto.resolvedBy;
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

    Ticket.prototype.setResolvedBy = function(resolvedBy) {
        this.resolvedBy = resolvedBy;
    };

    Ticket.prototype.isVesselAsset = function() {
        if(angular.isDefined(this.assetId) && angular.isDefined(this.assetId.type)){
            return this.assetId.type.toUpperCase() === 'VESSEL';
        }
        return false;
    };


    Ticket.prototype.copy = function() {
        var copy = new Ticket();

        copy.guid = this.guid;
        copy.openedDate = this.openedDate;
        if(this.assetId){
            copy.assetId = {
                type : this.assetId.type,
                value : this.assetId.value
            };
        }
        copy.ruleName = this.ruleName;
        copy.sender = this.sender;
        copy.resolvedDate = this.resolvedDate;
        copy.resolvedBy = this.resolvedBy;
        copy.status = this.status;
        return copy;
    };

    //Used for updating status
    Ticket.prototype.DTO = function(){
        var dto = {
            guid : this.guid,
            status: this.status,
        };
        if(this.isClosed()){
            dto.resolvedBy = this.resolvedBy;
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