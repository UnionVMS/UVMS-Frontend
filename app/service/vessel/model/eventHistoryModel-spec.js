describe('EventHistoryModel', function() {

  beforeEach(module('unionvmsWeb'));

    var historyData = {
        "eventId": "50c884e8-f03d-4222-841b-6ad1f2263694",
        "eventCode": "MOD",
        "eventDate": 1434924000000
    };

    it('create new should set correct values', inject(function(EventHistory) {
        var eventHistory = new EventHistory();

        expect(eventHistory.eventId).toBeUndefined();
        expect(eventHistory.eventCode).toBeUndefined();
        expect(eventHistory.eventDate).toBeUndefined();
    }));

    it("fromDTO should create correct object", inject(function(EventHistory) {
        var eventHistory = EventHistory.fromDTO(historyData);
        expect(eventHistory.eventId).toEqual(historyData.eventId);
        expect(eventHistory.eventCode).toEqual(historyData.eventCode);
        expect(eventHistory.eventDate).toEqual(historyData.eventDate);
    }));

    it("copy should create an identical object", inject(function(EventHistory) {
        var origEventHistory = EventHistory.fromDTO(historyData);
        var historyCopy = origEventHistory.copy();

        expect(historyCopy.eventId).toEqual(origEventHistory.eventId);
        expect(historyCopy.eventCode).toEqual(origEventHistory.eventCode);
        expect(historyCopy.eventDate).toEqual(origEventHistory.eventDate);

    }));
      
});
