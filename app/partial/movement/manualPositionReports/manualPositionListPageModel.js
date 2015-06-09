angular.module('unionvmsWeb') 
.factory('ManualPositionListPage', function() {

        function ManualPositionListPage(movements, currentPage, totalNumberOfPages){
            this.movements = _.isArray(movements) ? movements : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        //returns true/false if last page.
        ManualPositionListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        //returns lenght of array.
        ManualPositionListPage.prototype.getNumberOfItems = function() {
            return this.movements.length;
        };   

        return ManualPositionListPage;
    });