angular.module('unionvmsWeb').factory('globalSettingsService',function($resource, $q, $log) {

    var GlobalSettings = $resource("/config/rest/globals");

    var GlobalSetting = $resource("/config/rest/settings/:id", {}, {
        'put' : {
            method: 'PUT'
        }
    });

    var settings = {};

    var getSettingFromServer = function(){
        var deferred = $q.defer();
        GlobalSettings.get(function(response) {
            $.each(response.data, function(index, setting) {
                settings[setting.key] = setting;
            });

            //Verify that dateTimeFormat exists
            if(!('dateTimeFormat' in settings)){
                $log.warn("DateFormat from GlobalSettings is missing.");
            }
            deferred.resolve();
        }, function(err){
            $log.error("Failed to get global settings.");
            deferred.reject("Failed to load global settings.");
        });
        return deferred.promise;
    };

    //Create a new global setting
    var createNewGlobalSetting = function(key, value){
        var deferred = $q.defer();
        var dto = {
            "setting": {
                "module": "",
                "description": key,
                "global": true,
                "value": value,
                "key": key
            },
            "moduleName": ""
        };

        GlobalSetting.save(dto, function(response) {
            if(String(response.code) !== '200'){
                return deferred.reject("Invalid response status");
            }
            getSettingFromServer();
            deferred.resolve();
        },
        function(err){
            getSettingFromServer();
            deferred.reject("Error creating setting.");
        });
        return deferred.promise;
    };

    //Update an existing setting
    var updateGlobalSetting = function(key, value){
        var deferred = $q.defer();
        var setting = settings[key];
        setting.value = value;
        GlobalSetting.put({id: setting.id}, setting, function(response) {
            if(String(response.code) !== '200'){
                return deferred.reject("Invalid response status");
            }
            deferred.resolve();
        },
        function(err){
            getSettingFromServer();
            deferred.reject("Error updating setting.");
        });
        return deferred.promise;
    };

    var init = function(){
        getSettingFromServer();
    };

	var globalSettingsService = {
        getSettings : function(){
            return settings;
        },

        set : function(key, value, isArray) {
            //Update value if it's an array
            value = isArray ? value.join() : value;

            //Create new setting or update existing
            if (settings[key] === undefined) {
                return createNewGlobalSetting(key, value);
            } else{
                return updateGlobalSetting(key, value);
            }
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
        setup : function(){
            //No setting loaded
            if(Object.keys(settings).length === 0){
                return getSettingFromServer();
            }
            //Settings already loaded
            else{
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
        }
    };

    init();

	return globalSettingsService;
});