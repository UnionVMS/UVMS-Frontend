angular.module('unionvmsWeb') 
.factory('VesselListPage', function() {

        function VesselListPage(vessels, currentPage, totalNumberOfPages){
            this.vessels = _.isArray(vessels) ? vessels : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        VesselListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        VesselListPage.prototype.getNumberOfItems = function() {
            return this.vessels.length;
        };        

        //Find a vessel in the list of vessels by it's guid
        VesselListPage.prototype.getVesselByGuid = function(guid) {
            var foundVessel;
            $.each(this.vessels, function(index, vessel){
                if(vessel.getGuid() === guid){
                    foundVessel = vessel;
                    return false;
                }
            });

            return foundVessel;
        };        

        return VesselListPage;
    });
