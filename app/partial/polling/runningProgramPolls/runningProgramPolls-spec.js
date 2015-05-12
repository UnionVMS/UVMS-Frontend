describe('RunningProgramPollsCtrl', function(Poll) {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('RunningProgramPollsCtrl', {$scope: scope});
    }));    

    it('should be possible to start a current program poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STOPPED";
        p.attributes.START_DATE = "2015-05-01";
        p.attributes.END_DATE = "2015-05-15";

        spyOn(Date, "now").andReturn(new Date("2015-05-12"));
        expect(scope.possibleToStart(p)).toBe(true);
    }));

    it('should not be possible to start an expired program poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STOPPED";
        p.attributes.START_DATE = "2015-03-01";
        p.attributes.END_DATE = "2015-03-15";

        spyOn(Date, "now").andReturn(new Date("2015-05-12"));
        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should not be possible to start a future program poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STOPPED";
        p.attributes.START_DATE = "2015-03-01";
        p.attributes.END_DATE = "2015-03-15";

        spyOn(Date, "now").andReturn(new Date("2015-06-01"));
        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should not be possible to start an already started program poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STARTED";
        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should be possible to stop a started poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STARTED";
        expect(scope.possibleToStop(p)).toBe(true);
    }));

    it('should not be possible to stop an already stopped program poll', inject(function(Poll) {
        var p = new Poll();
        p.attributes.RUNNING = "STOPPED";
        expect(scope.possibleToStop(p)).toBe(false);
    }));
});
