angular.module('unionvmsWeb').factory('ExchangeListPage', function() {

    function ExchangeListPage(exchangeMessages, currentPage, totalNumberOfPages) {
        this.exchangeMessages = _.isArray(exchangeMessages) ? exchangeMessages : [];
        this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
        this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
    }

    ExchangeListPage.prototype.isLastPage = function() {
        return this.currentPage === this.totalNumberOfPages;
    };

    ExchangeListPage.prototype.getNumberOfItems = function() {
        return this.auditLogs.length;
    };

    return ExchangeListPage;

});
