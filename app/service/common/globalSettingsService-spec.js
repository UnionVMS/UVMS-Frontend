/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('globalSettingsService', function() {

    beforeEach(module('unionvmsWeb'));

    beforeEach(module(function($provide) {
        $provide.value({'$resource': function(url) {
            if (url === "/config/rest/globals") {
                return mockGlobalSettingsResource;
            }
            else if (url === "/config/rest/settings/:id") {
                return mockSingleSettingResource;
            }
        }});
    }));

    it('should set a single property value and reload settings', inject(function(globalSettingsService) {
        set(globalSettingsService, "myProperty", "myValue", false);
        expect(globalSettingsService.getSettings()["myProperty"]).toEqual({
            key: "myProperty",
            value: "myValue"
        });

        expect(globalSettingsService.get("myProperty", false)).toBe("myValue");
    }));

    it('should set a single array property value and reload settings', inject(function(globalSettingsService) {
        set(globalSettingsService, "myProperty", ["v1", "v2", "v3"], true);
        expect(globalSettingsService.getSettings()["myProperty"]).toEqual({
            key: "myProperty",
            value: "v1,v2,v3"
        });

        expect(globalSettingsService.get("myProperty", true)).toEqual(["v1", "v2", "v3"]);
    }));

    it('should get initial settings', inject(function(globalSettingsService) {
        var settings = globalSettingsService.getSettings();
        expect(Object.keys(settings).length).toBe(2);
        expect(settings["setting1"]).toEqual({
            key: "setting1",
            value: "value1"
        });
        expect(settings["timezone"]).toEqual({
            key: "timezone",
            value: 720
        });
    }));

    it('should update existing setting', inject(function(globalSettingsService) {
        spyOn(mockSingleSettingResource, 'put');
        globalSettingsService.set("setting1", "value1-updated");
        var settings = globalSettingsService.getSettings();
        expect(settings["setting1"]).toEqual({
            key: "setting1",
            value:  "value1-updated"
        });
    }));

    it('should return the timezone setting', inject(function(globalSettingsService) {
        var tz = globalSettingsService.getTimezone();
        expect(tz).toBe(720);
        expect(typeof tz).toBe('number');
    }));

    it('should get timezone from Date#getTimezoneOffset when setting is undefined', inject(function(globalSettingsService) {
        globalSettingsService.set('timezone', undefined);

        var tz = globalSettingsService.getTimezone();
        expect(tz).toBe(-(new Date().getTimezoneOffset()));
        expect(typeof tz).toBe('number');
    }));

    var set = function(globalSettingsService, key, value, isArray) {
        var expected = {
            setting: {
                module: "",
                description: key,
                global: true,
                value: isArray ? value.join() : value,
                key: key
            },
            moduleName: ""
        };

        spyOn(mockSingleSettingResource, 'save').andCallFake(function(data, callback, error) {
            callback({
                code: '200'
            });
        });

        spyOn(mockGlobalSettingsResource, 'get').andCallFake(function(callback) {
            callback({
                code: '200',
                data: [{
                    key: key,
                    value: isArray ? value.join() : value
                }]
            });
        });

        globalSettingsService.set(key, value, isArray);
        expect(mockSingleSettingResource.save).toHaveBeenCalledWith(expected, jasmine.any(Function), jasmine.any(Function));
        expect(mockGlobalSettingsResource.get).toHaveBeenCalled();
    };

    var getInitialSettings = function() {
        return [{
            key: "setting1",
            value: "value1"
        }, {
            key: "timezone",
            value: 720
        }];
    };

    var mockSingleSettingResource = {
        save: function(data, callback) {
            callback({code: '200', data: {}});
        },
        put: function(params, data, callback) {
            callback({code: '200'});
        }
    };

    var mockGlobalSettingsResource = {
        get: function(callback) {
            callback({
                code: '200',
                data: getInitialSettings()
            });
        }
    };

});