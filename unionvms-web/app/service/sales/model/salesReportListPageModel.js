(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('SalesReportListPage', salesReportListPageFactory);

    function salesReportListPageFactory() {

        function SalesReportListPage() {
            this.currentPage = 1;
            this.totalNumberOfPages = 1;
            this.items = [];
        }

        SalesReportListPage.prototype.isLastPage = function () {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        SalesReportListPage.prototype.getNumberOfItems = function () {
            return this.items.length;
        };

        //Find a sales note in the list of items by it's id
        SalesReportListPage.prototype.getById = function (id) {
            return _.find(this.items, function (item) { return item.id === id; });
        };

        return SalesReportListPage;
    }
})();
