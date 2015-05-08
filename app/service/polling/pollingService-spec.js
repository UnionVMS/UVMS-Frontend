describe('pollingService', function() {

    beforeEach(module('unionvmsWeb'));

    it('should add all selected mobile terminals', inject(function(pollingService, MobileTerminalGroup, MobileTerminal) {

        function createSomeTerminals() {
            return ["mt1","mt2","mt3"].map(function() {
                return new MobileTerminal();
            });
        }

        function createSomeTerminalGroups(groups, terminals) {
            return ["mtg1", "mtg2", "mtg3"].map(function() {
                var mtg = new MobileTerminalGroup();
                mtg.mobileTerminals = createSomeTerminals();
                return mtg;
            });
        }

        pollingService.getSelection().selectedMobileTerminals = createSomeTerminals();
        pollingService.getSelection().selectedMobileTerminalGroups = createSomeTerminalGroups();
        var mts = pollingService.getSelectedMobileTerminals();
        expect(mts.length).toBe(12);
    }));

    // it('', inject(function(pollingService, MobileTerminal, CommunicationChannel) {

    //     // A mobile terminal...
    //     var mt1 = new MobileTerminal();
    //     mt1.mobileTerminalId.systemType = "INGMARSAT_C";
    //     mt1.mobileTerminalId.ids["SERIAL_NUMBER"] = "ABC123";
    //     mt1.mobileTerminalId.ids["INTERNAL_ID"] = "678";

    //     // ... with a COM channel
    //     var com1 = new CommunicationChannel(1);
    //     com1.ids["DNID"] = "456";
    //     mt1.channels = [com1];

    //     // Return when needed
    //     spyOn(pollingService, "getSelectedMobileTerminals").andReturn();

    //     // OPTIONS
    //     pollingService.pollingOptions = {
    //         programPoll: {
    //             time: "01:30",
    //             startDate: "2015-05-06T15:00:00Z",
    //             endDate: "2015-06-30T00:00:00Z"
    //         },
    //         comment: "a comment 123",
    //         type: "PROGRAM"
    //     };

    //     var requestData = pollingService.getCreatePollsRequestData();

    //     var expected = {
    //         pollType: "PROGRAM_POLL",
    //         mobileTerminals: [{
    //             mobileTerminal: {
    //                 systemType: "INMARSAT_C",
    //                 idList: [{
    //                     value: "ABC123",
    //                     type: "SERIAL_NUMBER"
    //                 }]
    //             },
    //             comChannel: {
    //                 channelType: "VMS",
    //                 order: 1,
    //                 attributes: [{
    //                     value: "798",
    //                     type: "DNID"
    //                 }]
    //             }
    //         }],
    //         attributes: [{
    //             value: "456",
    //             key: "FREQUENCY"
    //         }],
    //         comment: "SoapUI test"
    //     };

    //     expect(requestData.equals(expected)).toBeTruthy();

    //     // expect(requestData.pollType).toBe("PROGRAM_POLL");
    //     // expect(requestData.attributes["startDate"]).toBe("2015-05-06T15:00:00Z");
    //     // expect(requestData.attributes["endDate"]).toBe("2015-05-06T15:00:00Z");
    //     // expect(requestData.comment).toBe("a comment 123");

    //     // expect(requestData.mobileTerminals.length).toBe(1);
    //     // expect(requestData.mobileTerminals[0].mobileTerminal.systemType).toBe("INGMARSAT_C");

    //     // expect(requestData.mobileTerminals[0].mobileTerminal.idList.length).toBe(2);
    //     // var actualSerialNumber, actualInternalId;
    //     // for (var i = 0; i < 2; i ++) {
    //     //     var id = requestData.mobileTerminals[i].mobileTerminal.idList[0];
    //     //     if (id["type"] === "SERIAL_NUMBER") {
    //     //         actualSerialNumber = id["value"];
    //     //     }
    //     //     else if (id["type"] === "INTERNAL_ID") {
    //     //         actualInternalId = id["value"];
    //     //     }
    //     //     else {
    //     //         // fail
    //     //     }
    //     // }

    //     // expect(actualSerialNumber).toBe("ABC123");
    //     // expect(actualInternalId).toBe("678");

    // }));
});