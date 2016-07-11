/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('Ticket', function() {

    var ticketData = {
        guid: "abcdd-12345-fewf",
        assetGuid : "DUMMY_VESSEL_GUID_1",
        movementGuid : "ABCD234567-JK345",
        openDate: "2015-10-09 08:13:09 +0200",
        updated: "2015-10-09 08:13:09 +0200",
        updatedBy: "close user",
        ruleName: "Da Rule",
        sender: "SWE",
        recipient: "DEN",
        status: "CLOSED",
        commont: "My comment here."
    };
    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);

        expect(ticket.guid).toEqual(ticketData.guid);
        expect(ticket.openDate).toEqual(ticketData.openDate);
        expect(ticket.vesselGuid).toEqual(ticketData.assetGuid);
        expect(ticket.positionGuid).toEqual(ticketData.movementGuid);
        expect(ticket.ruleName).toEqual(ticketData.ruleName);
        expect(ticket.sender).toEqual(ticketData.sender);
        expect(ticket.recipient).toEqual(ticketData.recipient);
        expect(ticket.updated).toEqual(ticketData.updated);
        expect(ticket.updatedBy).toEqual(ticketData.updatedBy);
        expect(ticket.status).toEqual(ticketData.status);
        expect(ticket.comment).toEqual(ticketData.comment);

    }));


    it("isOpen should return true only when status is OPEN", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);
        ticket.status = "OPEN";
        expect(ticket.isOpen()).toBeTruthy();

        ticket.status = "open";
        expect(ticket.isOpen()).toBeTruthy();

        ticket.status = "CLOSED";
        expect(ticket.isOpen()).toBeFalsy();

        ticket.status = "";
        expect(ticket.isOpen()).toBeFalsy();
    }));

    it("isClosed should return true only when status is CLOSED", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);
        ticket.status = "CLOSED";
        expect(ticket.isClosed()).toBeTruthy();

        ticket.status = "closed";
        expect(ticket.isClosed()).toBeTruthy();

        ticket.status = "OPEN";
        expect(ticket.isClosed()).toBeFalsy();

        ticket.status = "";
        expect(ticket.isClosed()).toBeFalsy();
    }));

    it("isPending should return true only when status is PENDING", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);
        ticket.status = "PENDING";
        expect(ticket.isPending()).toBeTruthy();

        ticket.status = "pending";
        expect(ticket.isPending()).toBeTruthy();

        ticket.status = "OPEN";
        expect(ticket.isPending()).toBeFalsy();

        ticket.status = "";
        expect(ticket.isPending()).toBeFalsy();
    }));


    it("DTO() should create an object with guid and status", inject(function(Ticket) {
        var ticket = new Ticket();
        ticket.setStatusToClosed();
        ticket.setUpdatedBy("TEST");
        var dto = ticket.DTO();

        expect(dto.guid).toEqual(ticket.guid);
        expect(dto.status).toEqual("CLOSED");
        expect(dto.updatedBy).toEqual("TEST");
    }));

    it('getResolvedDate should return updateDate when status isnt open or pending', inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);
        var updated = '2015-01-01 12:00:00';
        ticket.updated = updated;

        ticket.status = "OPEN";
        expect(ticket.getResolvedDate()).toBeUndefined();

        ticket.status = "PENDING";
        expect(ticket.getResolvedDate()).toBeUndefined();

        ticket.status = "CLOSED";
        expect(ticket.getResolvedDate()).toEqual(updated);

        ticket.status = "REJECTED";
        expect(ticket.getResolvedDate()).toEqual(updated);
    }));

    it('getResolvedBy should return updatedBy when status isnt open or pending', inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);
        var updatedBy = 'TEST_USER';
        ticket.updatedBy = updatedBy;

        ticket.status = "OPEN";
        expect(ticket.getResolvedBy()).toBeUndefined();

        ticket.status = "PENDING";
        expect(ticket.getResolvedBy()).toBeUndefined();

        ticket.status = "CLOSED";
        expect(ticket.getResolvedBy()).toEqual(updatedBy);

        ticket.status = "REJECTED";
        expect(ticket.getResolvedBy()).toEqual(updatedBy);
    }));
});