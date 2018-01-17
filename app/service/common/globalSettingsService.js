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
angular.module('unionvmsWeb').factory('globalSettingsService',['$resource', '$q', '$log',function($resource, $q, $log) {

    var GlobalSettings = $resource("/config/rest/globals");

    var GlobalSetting = $resource("/config/rest/settings/:id", {}, {
        'put' : {
            method: 'PUT'
        }
    });

    var settings = {};

    var getSettingsFromServerWithoutUpdate = function(){
      var deferred = $q.defer();
      GlobalSettings.get(function(response) {
          if(String(response.code) !== '200'){
              return deferred.reject("Failed to load global settings.");
          }
          deferred.resolve();
      }, function(err){
          $log.error("Failed to get global settings.");
          deferred.reject("Failed to load global settings.");
      });
      return deferred.promise;
  };

    var getSettingFromServer = function(){
        var deferred = $q.defer();
        GlobalSettings.get(function(response) {
            if(String(response.code) !== '200'){
                return deferred.reject("Failed to load global settings.");
            }

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
        getHeaderTemplate : function() {
            return this.get('headerTemplate',false);
        },
        getDateFormat : function(){
            return this.get('dateTimeFormat', false);
        },
        getDefaultHomePage : function(){
            return this.get('defaultHomePage', false);
        },
        getTimezone: function() {
            var tz = this.get('timezone', false);
            if (tz === undefined) {
                return -(new Date().getTimezoneOffset());
            }

            return Number(tz);
        },
        getSpeedUnit: function() {
            return this.get('speedUnit', false);
        },
        getDistanceUnit: function() {
            return this.get('distanceUnit', false);
        },
        getMaxSpeed : function(){
            return this.get('maxSpeed', false);
        },
        getAvailableLanguages : function(){
            return this.get('availableLanguages', true);
        },
        getLengthUnit: function() {
            return this.get('measurementSystem', false) === 'imperial' ? 'ft' : 'm';
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
        },
        getSettingsFromServerWithoutUpdate: getSettingsFromServerWithoutUpdate

    };

    init();

	return globalSettingsService;
}]);
