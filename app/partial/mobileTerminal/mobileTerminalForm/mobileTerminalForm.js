/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('mobileTerminalFormCtrl',function($filter, $scope, locale, MobileTerminal, userService){

    //Make sure user has access to edit
    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    $scope.disableMobileTerminalForm = function(){
        if(!checkAccessToFeature('manageMobileTerminals')){
            return true;
        } else {
            return false;
        }
    }

    //Show/hide assign vessel
    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };

    // Functions for form
    $scope.mobileTerminalFormFunctions = {
        displayMobileTerminalList: function(){
            $scope.searchMobileTerminals();
            $scope.toggleMobileTerminalDetails();
        }
    }
});
