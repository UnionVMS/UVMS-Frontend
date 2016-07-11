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
var userPreferencesServiceModule = angular.module('userPreferencesServiceModule', ['ngResource']);

userPreferencesServiceModule.factory('userPreferencesService', ['$resource', '$q', '$log',
    function ($resource, $q, $log) {

        return {
            getUserPreferences: function (userName,groupName) {
                var message = "";
                var deferred = $q.defer();

                var resource = $resource('/usm-administration/rest/users/:userName/userPreferences', {"userName":userName});
                resource.get(groupName).$promise.then(
                    function (data) {
                        deferred.resolve({
                            userPreferences: data.results
                        });
                    },
                    function (error) {
                        $log.log(error);
                        message = error.data.message;
                        deferred.reject(message);
                    }
                );

                return deferred.promise;
            }
        };

    }]);