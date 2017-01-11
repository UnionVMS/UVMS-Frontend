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
angular.module('unionvmsWeb').controller('MobileterminallistCtrl',function($scope){


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

    $scope.checkMobileTerminal = function(item){
        item.Selected = !item.Selected;
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
        }      
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedMobileTerminals.length === 0){
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
        $.each($scope.selectedMobileTerminals, function(index, mobileTerminal){
            if(mobileTerminal.isEqualTerminal(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };

    $scope.getDefaultDnid = function(channels) {
        var defaultDnid;
        $.each(channels, function(index, channel){
            if (channel.capabilities.DEFAULT_REPORTING && channel.ids.DNID !== undefined) {
                defaultDnid = channel.ids.DNID;
            }
        });
        return defaultDnid;
    };

    $scope.getDefaultMemberNumber = function(channels) {
        var defaultMemberNumber;
        $.each(channels, function(index, channel){
            if (channel.capabilities.DEFAULT_REPORTING && channel.ids.MEMBER_NUMBER !== undefined) {
                defaultMemberNumber = channel.ids.MEMBER_NUMBER;
            }
        });
        return defaultMemberNumber;
    };
});