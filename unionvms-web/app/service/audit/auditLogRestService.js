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
angular.module('unionvmsWeb').factory('auditLogRestFactory', function($resource) {

    return {
        getAuditLogList: function() {
            return $resource('audit/rest/audit/list', {}, {
                list: { method: 'POST' }
            });
        },
        getConfigValues : function(){
            return $resource('audit/rest/audit/config');
        }
    };

}).service('auditLogRestService', function($q, auditLogRestFactory, SearchResultListPage, Audit) {

    return {
        getAuditLogList: function(request) {
            var deferred = $q.defer();
            auditLogRestFactory.getAuditLogList().list(request.DTOForAuditLogList(), function(response) {
                if (response.code !== "200") {
                    deferred.reject("getAuditLogList: invalid response status: " + response.code);
                    return;
                }

                var auditLogs = [];
                if (response.data.auditLog) {
                    for (var i = 0; i < response.data.auditLog.length; i++) {
                        auditLogs.push(Audit.fromJson(response.data.auditLog[i]));
                    }
                }

                deferred.resolve(new SearchResultListPage(auditLogs, response.data.currentPage, response.data.totalNumberOfPages));
            },
            function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getAuditConfiguration : function(){
            var def = $q.defer();
            auditLogRestFactory.getConfigValues().get({},
                function(response){
                    if(response.code !== 200){
                        def.reject("Not valid audit configuration status.");
                        return;
                    }
                    def.resolve(response.data);
                },
                function(error){
                    console.error("Error getting configuration values for audit.");
                    def.reject(error);
                }
            );
        return def.promise;
        }

    };
});