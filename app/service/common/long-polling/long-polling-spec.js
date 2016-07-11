/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('long-polling', function() {

    beforeEach(module('unionvmsWeb.longPolling'));

    beforeEach(module(function($provide) {
        $provide.factory('globalSettingsService', MockGlobalSettingsService);
    }));

    beforeEach(inject(function($httpBackend) {
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data: []});
        $httpBackend.whenGET('/long/polling/path').respond({
            updated: ['a', 'b', '123']
        });
        $httpBackend.whenGET('/long/polling/path/new').respond({
            created: ['a', 'b', '123']
        });

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

    it('should call separate callback when created', inject(function($httpBackend, longPolling, $rootScope) {
        var callbacks = {
            'onCreate': jasmine.createSpy('onCreate').andCallFake(function() {
                longPolling.cancel(sessionId);
            })
        };

        var sessionId = longPolling.poll('/long/polling/path/new', callbacks);
        $rootScope.$digest();
        $httpBackend.flush();
        expect(callbacks.onCreate).toHaveBeenCalledWith(['a', 'b', '123']);
    }));

    it('should call separate callback when updated', inject(function($httpBackend, longPolling, $rootScope) {
        var callbacks = {
            'onUpdate': jasmine.createSpy('onUpdate').andCallFake(function() {
                longPolling.cancel(sessionId);
            })
        };

        var sessionId = longPolling.poll('/long/polling/path', callbacks);
        $rootScope.$digest();
        $httpBackend.flush();
        expect(callbacks.onUpdate).toHaveBeenCalledWith(['a', 'b', '123']);
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