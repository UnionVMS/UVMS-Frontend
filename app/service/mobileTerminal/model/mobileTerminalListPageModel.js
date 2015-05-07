angular.module('unionvmsWeb')
    .factory('MobileTerminalListPage', function() {

        function MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages){
            this.mobileTerminals = _.isArray(mobileTerminals) ? mobileTerminals : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        MobileTerminalListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages;
        };

        MobileTerminalListPage.prototype.getNumberOfItems = function() {
            return this.mobileTerminals.length;
        };

        return MobileTerminalListPage;
    });

