describe('Exchange', function() {

  beforeEach(module('unionvmsWeb'));

    var exchangeDTO = {
        "id": "81584cff-f195-46b3-a750-54214bc8d8de",
        "incoming": false,
        "dateRecieved": "2015-11-19 09:15:31 +0100",
        "senderRecipient": "123455467",
        "recipient": "Test",
        "dateFwd": "2015-01-01 12:00:00",
        "status": "ISSUED",
        "type": "SENT_POLL",
        "rule": "MOCK RULE",
        "source": "MY SOURCE",
        "logData": {
            "guid": "a96d5d34-7cbc-420f-a333-387407b41e14",
            "type": "POLL"
        }
    };


    it("should parse DTO correctly", inject(function(Exchange) {
        var exchange = Exchange.fromJson(exchangeDTO);

        expect(exchange.id).toEqual(exchangeDTO.id);
        expect(exchange.incoming).toEqual(exchangeDTO.incoming);
        expect(exchange.dateReceived).toEqual(exchangeDTO.dateRecieved);
        expect(exchange.senderRecipient).toEqual(exchangeDTO.senderRecipient);
        expect(exchange.recipient).toEqual(exchangeDTO.recipient);
        expect(exchange.dateFwd).toEqual(exchangeDTO.dateFwd);
        expect(exchange.status).toEqual(exchangeDTO.status);
        expect(exchange.logData.guid).toEqual(exchangeDTO.logData.guid);
        expect(exchange.logData.type).toEqual(exchangeDTO.logData.type);
        expect(exchange.forwardRule).toEqual(exchangeDTO.rule);
        expect(exchange.source).toEqual(exchangeDTO.source);
        expect(exchange.type).toEqual(exchangeDTO.type);
    }));


    it("isEqualExchange should return true when ids are the same", inject(function(Exchange) {
        var exchange = Exchange.fromJson(exchangeDTO);
        var exchange2 = Exchange.fromJson(exchangeDTO);
        var exchange3 = new Exchange();
        exchange3.id = exchange.id;


        expect(exchange.isEqualExchange(exchange2)).toBeTruthy();
        expect(exchange.isEqualExchange(exchange3)).toBeTruthy();

        exchange2.id = 'changed';
        expect(exchange.isEqualExchange(exchange2)).toBeFalsy();
    }));

});
