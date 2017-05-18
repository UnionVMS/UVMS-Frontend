(function () {
    'use strict';
   
    angular
        .module('unionvmsWeb')
        .factory('SalesNoteListPage', salesNoteListPageFactory);

    function salesNoteListPageFactory() {

        function SalesNoteListPage() {
            this.currentPage = 1;
            this.totalNumberOfPages = 1;
            this.items = [];
        }

        SalesNoteListPage.prototype.isLastPage = function () {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        SalesNoteListPage.prototype.getNumberOfItems = function () {
            return this.items.length;
        };

        //Find a sales note in the list of items by it's id
        SalesNoteListPage.prototype.getById = function (id) {
            return _.find(this.items, function (item) { return item.id === id; });
        };

        return SalesNoteListPage;
    }
})();