describe('PollResult', function() {

  beforeEach(module('unionvmsWeb'));

    var dto =  {
        "unsentPoll":false,
        "sentPolls":["c1b44664-7e13-4b01-8f0c-e96fd0ca9a34"],
        "unsentPolls":[]
    };

    it('fromDTO should prase the DTO correct', inject(function(PollResult) {
        var pollResult = PollResult.fromDTO(dto);
        expect(pollResult.success).toBeTruthy();
        expect(pollResult.sentPollGuids.length).toEqual(1);
        expect(pollResult.unsentPollsGuids.length).toEqual(0);
    }));

});


