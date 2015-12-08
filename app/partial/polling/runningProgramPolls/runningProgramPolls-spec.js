describe('RunningProgramPollsCtrl', function(Poll) {

    beforeEach(module('unionvmsWeb'));

    var scope, createController;

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            return $controller('RunningProgramPollsCtrl', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should search for program polls on init', inject(function($q, pollingRestService) {
        var deferred = $q.defer();
        var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(deferred.promise);
        var controller = createController();

        expect(searchSpy).toHaveBeenCalled();
    }));

    describe('get program polls', function() {

        it('should get program polls from the server', inject(function($q, Poll, pollingRestService) {

            var deferred = $q.defer();
            var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(deferred.promise);
            var poll = new Poll();
            poll.id = "ABCD-123";
            var results = [poll];
            deferred.resolve(results);

            var controller = createController();

            //Search is done on init
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(poll);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('should handle error when trying to get program polls from server', inject(function($q, pollingRestService, locale) {

            var deferred = $q.defer();
            var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(deferred.promise);
            var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            //Search is done on init
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

    });

    it('startProgramPoll should send request to server and update results', inject(function($q, Poll, pollingRestService, userService, Vessel) {
        //Allow evertyhing
        spyOn(userService, 'isAllowed').andReturn(true);

        var searchDeferred = $q.defer();
        var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(searchDeferred.promise);

        //Mock rest service
        var deferred = $q.defer();
        var startedPoll = new Poll();
        startedPoll.attributes.PROGRAM_RUNNING = "TRUE";
        deferred.resolve(startedPoll);
        var startRestServiceSpy = spyOn(pollingRestService, 'startProgramPoll').andReturn(deferred.promise);

        var controller = createController();
        //Mock poll and results
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "FALSE";
        var vessel = new Vessel();
        vessel.name = "TEST";
        p.setVessel(vessel);
        scope.currentSearchResults.items = [p];

        //Make poll startable
        spyOn(scope, 'possibleToStart').andReturn(true);

        //Start the program poll
        scope.startProgramPoll(p);
        scope.$digest();

        expect(startRestServiceSpy).toHaveBeenCalled();

        //The poll in the search result should have been updated with the one from the server
        expect(scope.currentSearchResults.items.length).toBe(1);
        expect(scope.currentSearchResults.items[0].attributes["PROGRAM_RUNNING"]).toEqual('TRUE');
        expect(scope.currentSearchResults.items[0].vessel).toEqual(vessel);
    }));

    it('stopProgramPoll should send request to server and update results', inject(function($q, Poll, pollingRestService, userService, Vessel) {
        //Allow evertyhing
        spyOn(userService, 'isAllowed').andReturn(true);

        var searchDeferred = $q.defer();
        var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(searchDeferred.promise);

        //Mock rest service
        var deferred = $q.defer();
        var stoppedPoll = new Poll();
        stoppedPoll.attributes.PROGRAM_RUNNING = "FALSE";
        deferred.resolve(stoppedPoll);
        var stopRestServiceSpy = spyOn(pollingRestService, 'stopProgramPoll').andReturn(deferred.promise);

        var controller = createController();
        //Mock poll and results
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "TRUE";
        var vessel = new Vessel();
        vessel.name = "TEST";
        p.setVessel(vessel);
        scope.currentSearchResults.items = [p];

        //Make poll stoppable
        spyOn(scope, 'possibleToStop').andReturn(true);

        //Start the program poll
        scope.stopProgramPoll(p);
        scope.$digest();

        expect(stopRestServiceSpy).toHaveBeenCalled();

        //The poll in the search result should have been updated with the one from the server
        expect(scope.currentSearchResults.items.length).toBe(1);
        expect(scope.currentSearchResults.items[0].attributes["PROGRAM_RUNNING"]).toEqual('FALSE');
        expect(scope.currentSearchResults.items[0].vessel).toEqual(vessel);
    }));

    it('deleteProgramPoll should send request to server and update results', inject(function($q, Poll, pollingRestService, confirmationModal, userService) {
        //Allow evertyhing
        spyOn(userService, 'isAllowed').andReturn(true);

        //Mock confirmation modal and click on confirm
        var confirmationSpy = spyOn(confirmationModal, "open").andCallFake(function(callback, options){
            callback();
        });

        var searchDeferred = $q.defer();
        var searchSpy = spyOn(pollingRestService, "getRunningProgramPolls").andReturn(searchDeferred.promise);

        //Mock rest service
        var deferred = $q.defer();
        deferred.resolve();
        var inactivateRestServiceSpy = spyOn(pollingRestService, 'inactivateProgramPoll').andReturn(deferred.promise);

        var controller = createController();
        //Mock poll and results
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "TRUE";
        scope.currentSearchResults.items = [p];

        //Start the program poll
        scope.deleteProgramPoll(p);
        scope.$digest();

        expect(inactivateRestServiceSpy).toHaveBeenCalled();

        //The poll in the search result should have been removed
        expect(scope.currentSearchResults.items.length).toBe(0);
    }));

    it('should be possible to start a current program poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "FALSE";
        p.attributes.START_DATE = "2015-01-01";
        p.attributes.END_DATE = "2045-05-15";
        expect(scope.possibleToStart(p)).toBe(true);
    }));

    it('should not be possible to start an expired program poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "FALSE";
        p.attributes.START_DATE = "2015-01-01";
        p.attributes.END_DATE = "2015-03-15";

        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should not be possible to start a future program poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "FALSE";
        p.attributes.START_DATE = "2045-03-01";
        p.attributes.END_DATE = "2045-03-15";

        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should not be possible to start an already started program poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "TRUE";
        expect(scope.possibleToStart(p)).toBe(false);
    }));

    it('should be possible to stop a started poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.START_DATE = "2015-01-01";
        p.attributes.END_DATE = "2045-03-15";
        p.attributes.PROGRAM_RUNNING = "TRUE";
        expect(scope.possibleToStop(p)).toBe(true);
    }));

    it('should not be possible to stop an already stopped program poll', inject(function(Poll) {
        var controller = createController();
        var p = new Poll();
        p.attributes.PROGRAM_RUNNING = "FALSE";
        expect(scope.possibleToStop(p)).toBe(false);
    }));
});
