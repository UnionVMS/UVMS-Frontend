angular.module('unionvmsWeb')
.factory('VesselListPage', function() {

        function VesselListPage(items, currentPage, totalNumberOfPages){
            this.items = _.isArray(items) ? items : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        VesselListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages || this.totalNumberOfPages === 0;
        };

        VesselListPage.prototype.getNumberOfItems = function() {
            return this.items.length;
        };

        //Find a vessel in the list of items by it's guid
        VesselListPage.prototype.getVesselByGuid = function(guid) {
            if(angular.isDefined(guid)){
                var foundVessel;
                $.each(this.items, function(index, vessel){
                    if(vessel.getGuid() === guid){
                        foundVessel = vessel;
                        return false;
                    }
                });

                return foundVessel;
            }
        };

        //Find a vessel in the list of items by it's CFR
        VesselListPage.prototype.getVesselByCFR = function(cfr) {
            if(angular.isDefined(cfr)){
                var foundVessel;
                $.each(this.items, function(index, vessel){
                    if(vessel.cfr === cfr){
                        foundVessel = vessel;
                        return false;
                    }
                });
                return foundVessel;
            }
        };

        return VesselListPage;
    });
