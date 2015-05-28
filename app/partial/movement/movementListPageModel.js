angular.module('unionvmsWeb') 
.factory('MovementListPage', function() {

        function MovementListPage(movements, currentPage, totalNumberOfPages){
            this.movements = _.isArray(movements) ? movements : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        //returns true/false if last page.
        MovementListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        //returns lenght of array.
        MovementListPage.prototype.getNumberOfItems = function() {
            return this.movements.length;
        };   

        return MovementListPage;
    });