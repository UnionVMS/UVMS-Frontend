angular.module('unionvmsWeb') 
.factory('VesselListPage', function() {

        function VesselListPage(vessels, currentPage, totalNumberOfPages){
            this.vessels = vessels;
            this.currentPage = currentPage;
            this.totalNumberOfPages = totalNumberOfPages;
        }

        VesselListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages;
        };
 
        return VesselListPage;
    });
