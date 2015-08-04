angular.module('unionvmsWeb').factory('auditLogRestFactory', function($resource, restConstants) {

    return {
        getAuditLogList: function() {
            return $resource(restConstants.baseUrl + '/audit/rest/audit/list', {}, {
                list: { method: 'POST' }
            });
        }
    };

}).service('auditLogRestService', function($q, auditLogRestFactory, AuditLogListPage, Audit) {

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

                deferred.resolve(new AuditLogListPage(auditLogs, response.data.currentPage, response.data.totalNumberOfPages));
            },
            function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }
    };
});
