angular.module('unionvmsWeb').factory('globalSettingsService',function($resource, $q, $log) {

    var GlobalSettings = $resource("/config/rest/globals");

    var GlobalSetting = $resource("/config/rest/settings/:id", {}, {
        'put' : {
            method: 'PUT'
        }
    });

    var settings = {};

    var getSettingFromServer = function(){
        GlobalSettings.get(function(response) {
            $.each(response.data, function(index, setting) {
                settings[setting.key] = setting;
            });
        });
    };

    var init = function(){
        getSettingFromServer();
    };

	var globalSettingsService = {
        getSettings : function(){
            return settings;
        },

        set : function(key, value, isArray) {
            if (settings[key] === undefined) {
                return;
            }

            var deferred = $q.defer();
            var setting = settings[key];
            setting.value = isArray ? value.join() : value;
            GlobalSetting.put({id: setting.id}, setting, function(response) {
                if(String(response.code) !== '200'){
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve();
            },
            function(err){
                $log.error("Error saving setting.", err);
                getSettingFromServer();
                deferred.reject(err);
            });
            return deferred.promise;
        },

        get : function(key, isArray) {
            if (settings[key] === undefined) {
                return isArray ? [] : undefined;
            }

            var value = settings[key].value;
            if (isArray) {
                return value.length > 0 ? value.split(",") : [];
            }

            return value;
        },
        getCoordinateFormat : function(){
            return this.get('coordinateFormat', false);
        },
        getDateFormat : function(){
            return this.get('dateTimeFormat', false);
        },
        getDefaultHomePage : function(){
            return this.get('defaultHomePage', false);
        },
    };

    init();

	return globalSettingsService;
});