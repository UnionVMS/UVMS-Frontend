angular.module('unionvmsWeb')
    .factory('MobileTerminalListPage', function() {

        function MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages){
            this.mobileTerminals = mobileTerminals;
            this.currentPage = currentPage;
            this.totalNumberOfPages = totalNumberOfPages;
        }

        MobileTerminalListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages;
        };

        return MobileTerminalListPage;
    });

