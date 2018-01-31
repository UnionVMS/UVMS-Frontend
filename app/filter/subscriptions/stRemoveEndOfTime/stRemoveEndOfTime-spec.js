describe('stRemoveEndOfTime', function() {

    var filter;

    beforeEach(module('unionvmsWeb'));
    beforeEach(inject(function($filter) {
        filter = $filter('stRemoveEndOfTime');
    }));

    it('should return the date itself if the date is not end of time', inject(function(){
        var date = '2016-10-21T08:28:21';
        expect(filter(date)).toEqual(date);
    }));

    it('should return undefined if date is end of time', inject(function(){
        var date = '9999-01-01T00:00:00';
        expect(filter(date)).toBeUndefined();
    }));
});
