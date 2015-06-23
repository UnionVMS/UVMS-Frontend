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

        //Find a vessel in the list of vessels by it's id and idType
        VesselListPage.prototype.getVesselById = function(id, idType) {
            var foundVessel;
            $.each(this.vessels, function(index, vessel){
                if(idType === 'GUID'){
                    if(vessel.vesselId.type === 'GUID' && vessel.vesselId.value === id){
                        foundVessel = vessel;
                        return false;
                    }
                }
                //Check attribute on vessel object
                else{
                    if(vessel[idType.toLowerCase()] === id){
                        foundVessel = vessel;
                        return false;
                    }
                }
            });

            return foundVessel;
        };        

        return VesselListPage;
    });
