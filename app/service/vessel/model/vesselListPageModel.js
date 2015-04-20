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
 
        //Find a vessel in the list of vessels by its internal id
        VesselListPage.prototype.getVesselByInternalId = function(internalId) {
            var foundVessel;
            $.each(this.vessels, function(index, vessel){
                if(vessel.vesselId.type === 'ID' && vessel.vesselId.value === internalId){
                    foundVessel = vessel;
                    return false;
                }
            });

            return foundVessel;
        };

        return VesselListPage;
    });
