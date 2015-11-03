describe('Ticket', function() {

    var ticketData = {
        guid: "abcdd-12345-fewf",
        vesselGuid : "DUMMY_VESSEL_GUID_1",
        positionGuid : "ABCD234567-JK345",
        openDate: "2015-10-09 08:13:09 +0200",
        updated: "2015-10-09 08:13:09 +0200",
        updatedBy: "close user",
        ruleName: "Da Rule",
        sender: "SWE",
        status: "CLOSED",
    };
    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);

        expect(ticket.guid).toEqual(ticketData.guid);
        expect(ticket.openDate).toEqual(ticketData.openDate);
        expect(ticket.vesselGuid).toEqual(ticketData.vesselGuid);
        expect(ticket.positionGuid).toEqual(ticketData.positionGuid);
        expect(ticket.ruleName).toEqual(ticketData.ruleName);
        expect(ticket.sender).toEqual(ticketData.sender);
        expect(ticket.updated).toEqual(ticketData.updated);
        expect(ticket.updatedBy).toEqual(ticketData.updatedBy);
        expect(ticket.status).toEqual(ticketData.status);

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

});
