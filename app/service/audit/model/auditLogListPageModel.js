angular.module('unionvmsWeb').factory('AuditLogListPage', function() {

    function AuditLogListPage(auditLogs, currentPage, totalNumberOfPages) {
        this.auditLogs = _.isArray(auditLogs) ? auditLogs : [];
        this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
        this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
    }

    AuditLogListPage.prototype.isLastPage = function() {
        return this.currentPage === this.totalNumberOfPages;
    };

    AuditLogListPage.prototype.getNumberOfItems = function() {
        return this.auditLogs.length;
    };

    return AuditLogListPage;

});
