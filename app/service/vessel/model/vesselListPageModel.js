/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
        
      //Find a vessel in the list of items by it's history guid
        VesselListPage.prototype.getVesselByHistoryGuid = function(guid) {
            if(angular.isDefined(guid)){
                var foundVessel;
                $.each(this.items, function(index, vessel){
                    if(vessel.getHistoryGuid() === guid){
                        foundVessel = vessel;
                        return false;
                    }
                });

                return foundVessel;
            }
        };

        return VesselListPage;
    });