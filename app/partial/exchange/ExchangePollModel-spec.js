describe('ExchangePoll', function() {

  beforeEach(module('unionvmsWeb'));

    var exchangePollDTO = {
        "guid": "0352a8cc-49e5-4aed-85b0-d8ab8e341d48",
        "typeRef": {
            "refGuid": "ec3651b3-3fb6-4d71-9ca5-4e2bb5206eb3",
            "type": "POLL"
        },
        "history": [
            {
                "timestamp": 1446715153522,
                "status": "ISSUED"
            },
            {
                "timestamp": 1446715152522,
                "status": "SENT"
            }
        ]
    };


    it("should parse DTO correctly", inject(function(ExchangePoll) {
        var exchangePoll = ExchangePoll.fromDTO(exchangePollDTO);

        expect(exchangePoll.guid).toEqual(exchangePollDTO.guid);
        expect(exchangePoll.pollGuid).toEqual(exchangePollDTO.typeRef.refGuid);
        expect(exchangePoll.history.length).toEqual(2);
        expect(exchangePoll.history[0].status).toEqual("ISSUED");
        expect(exchangePoll.history[0].time).toEqual(1446715153522);
        expect(exchangePoll.history[1].status).toEqual("SENT");
        expect(exchangePoll.history[1].time).toEqual(1446715152522);
    }));


});
