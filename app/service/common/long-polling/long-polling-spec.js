describe('long-polling', function() {

    beforeEach(module('unionvmsWeb.longPolling'));

    beforeEach(module(function($provide) {
        $provide.factory('globalSettingsService', MockGlobalSettingsService);
    }));

    beforeEach(inject(function($httpBackend) {
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data: []});
        $httpBackend.whenGET('/long/polling/path').respond({});
    }));

    it('should poll three times, then cancel', inject(function(longPolling, $httpBackend, globalSettingsService, $rootScope) {
        var completedPolls = 0;
        var sessionId = longPolling.poll('/long/polling/path', function() {
            if (++completedPolls === 3) {
                longPolling.cancel(sessionId);
            }
        });

        $rootScope.$digest();
        $httpBackend.flush();
        expect(completedPolls).toBe(3);
    }));

    it('should not poll if disabled', inject(function(longPolling, $httpBackend, globalSettingsService, $rootScope) {
        globalSettingsService.set('longPollingEnabled', 'false');
        var completedPolls = 0;
        var sessionId = longPolling.poll('/long/polling/path', function() {
            completedPolls++;
            longPolling.cancel(sessionId);
        });

        $rootScope.$digest();
        $httpBackend.verifyNoOutstandingRequest();
        expect(completedPolls).toBe(0);
    }));

    function MockGlobalSettingsService() {
        var settings = {
            'longPollingEnabled': 'true'
        };

        return {
            set: function(key, value) {
                settings[key] = value;
            },
            get: function(key) {
                return settings[key];
            }
        };
    }
});