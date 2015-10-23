describe('Ticket', function() {

    var ticketData = {
        guid: "abcdd-12345-fewf",
        assetId: {
            type: "DUMMY_ASSET_TYPE_1",
            value: "DUMMY_ASSET_TYPE_VALUE_1"
        },
        openDate: "2015-10-09 08:13:09 +0200",
        resolveDate: "2015-10-09 08:13:09 +0200",
        resolvedBy: "close user",
        ruleName: "Da Rule",
        sender: "SWE",
        status: "CLOSED",
    };

    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Ticket) {
        var ticket = Ticket.fromDTO(ticketData);

        expect(ticket.guid).toEqual(ticketData.guid);
        expect(ticket.openedDate).toEqual(ticketData.openDate);
        expect(ticket.assetId.type).toEqual(ticketData.assetId.type);
        expect(ticket.assetId.value).toEqual(ticketData.assetId.value);
        expect(ticket.ruleName).toEqual(ticketData.ruleName);
        expect(ticket.sender).toEqual(ticketData.sender);
        expect(ticket.resolvedDate).toEqual(ticketData.resolveDate);
        expect(ticket.resolvedBy).toEqual(ticketData.resolvedBy);
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

    it("isVesselAsset() should return true only when assetId type is VESSEL", inject(function(Ticket) {
        var ticket = new Ticket();
        expect(ticket.isVesselAsset()).toBeFalsy();

        ticket.assetId = {
            type : "VESSEL",
            value : "test-123"
        };
        expect(ticket.isVesselAsset()).toBeTruthy();

       ticket.assetId = {
            type : "OTHER_TYPE",
            value : "test-123"
        };

        expect(ticket.isVesselAsset()).toBeFalsy();
    }));


    it("DTO() should create an object with guid and status", inject(function(Ticket) {
        var ticket = new Ticket();
        ticket.setStatusToClosed();
        ticket.setResolvedBy("TEST");
        var dto = ticket.DTO();

        expect(dto.guid).toEqual(ticket.guid);
        expect(dto.status).toEqual("CLOSED");
        expect(dto.resolvedBy).toEqual("TEST");
    }));

});
