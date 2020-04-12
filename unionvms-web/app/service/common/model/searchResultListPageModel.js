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
    .factory('SearchResultListPage', function() {

        function SearchResultListPage(items, currentPage, totalNumberOfPages){
            this.items = _.isArray(items) ? items : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        SearchResultListPage.prototype.getNumberOfItems = function(){
            return this.items.length;
        };


        //Find an item in the list of items by a property
        SearchResultListPage.prototype.getItemByProperty = function(propertyKey, propertyValue) {
            if(angular.isDefined(propertyKey) && angular.isDefined(propertyValue)){
                var foundItem;
                $.each(this.items, function(index, anItem){
                    if(anItem[propertyKey] === propertyValue){
                        foundItem = anItem;
                        return false;
                    }
                });

                return foundItem;
            }
        };

        SearchResultListPage.prototype.hasItemWithGuid = function(guid) {
            return !!this.getItemByProperty("guid", guid);
        };

        return SearchResultListPage;
    });