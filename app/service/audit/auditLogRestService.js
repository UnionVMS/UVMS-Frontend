angular.module('unionvmsWeb').factory('auditLogRestFactory', function($resource) {

    return {
        getAuditLogList: function() {
            return $resource('/audit/rest/audit/list', {}, {
                list: { method: 'POST' }
            });
        },
        getConfigValues : function(){
            return $resource('/audit/rest/audit/config');
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
