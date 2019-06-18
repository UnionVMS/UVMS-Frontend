/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
        this.ticketCount = undefined;
        this.comment = undefined;
    }

    Ticket.fromJSON = function(data){
        var ticket = new Ticket();
        ticket.guid = data.guid;
        ticket.openDate = data.openDate;

        ticket.vesselGuid = data.assetGuid;
        ticket.positionGuid = data.movementGuid;
        ticket.ruleName = data.ruleName;
        ticket.sender = data.sender;
        ticket.recipient = data.recipient;
        ticket.updated = data.updated;
        ticket.updatedBy = data.updatedBy;
        ticket.status = data.status;
        ticket.ticketCount = data.ticketCount;
        ticket.comment = data.comment;
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
        copy.comment = this.comment;

        if(angular.isDefined(this.vessel)){
            copy.vessel = this.vessel.copy();
        }
        return copy;
    };

    //Used for updating status
    Ticket.prototype.DTO = function(){
        var dto = {
            guid : this.guid,
            status: this.status
        };
        if(this.isClosed()){
            dto.updatedBy = this.updatedBy;
            dto.comment = this.comment;
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
