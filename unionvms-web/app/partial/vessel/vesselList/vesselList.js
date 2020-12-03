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
angular.module('unionvmsWeb').controller('VesselListCtrl',function($scope){

    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){
        if($scope.isAllChecked()){
            //Remove all
            $scope.clearSelection();
        }else{
            //Add all
            $scope.clearSelection();
            $.each($scope.currentSearchResults.items, function(index, item) {
                $scope.addToSelection(item);
            });
        }
    };

    $scope.checkItem = function(item){
        item.Selected = !item.Selected;
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
        }
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedVessels.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.currentSearchResults.items, function(index, item) {
            if(!$scope.isChecked(item)){
                allChecked = false;
                return false;
            }
        });
        return allChecked;
    };

    $scope.isChecked = function(item){
        var checked = false;
        $.each($scope.selectedVessels, function(index, vessel){
            if(vessel.equals(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };

    $scope.tableCallback = function(tableState){
        $scope.stTable.tableState = tableState;
        var pageNumber = $scope.stTable.tableState.pagination.start / $scope.stTable.itemsByPage;
        var predicate = undefined;
        var reverse = undefined;
        var options = undefined;
        var page = undefined;
        if (angular.isDefined($scope.stTable.page) && pageNumber + 1 !== $scope.stTable.page){
            $scope.stTable.page = pageNumber + 1;
            page = $scope.stTable.page;
        } 
        if (angular.isDefined(tableState.sort.predicate) && angular.isDefined($scope.currentSearchResultsByPage) && $scope.currentSearchResultsByPage.length > 0){
            predicate = tableState.sort.predicate;
            reverse = tableState.sort.reverse;
        }
        $scope.sortTableData(predicate, reverse, options, page);
    };
});