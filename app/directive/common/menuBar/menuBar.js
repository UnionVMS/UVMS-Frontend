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

angular.module('unionvmsWeb')
    .directive('menuBar', function() {
	return {
		restrict: 'E',
		replace: true,
        require: "^ngModel",
		scope: {
            header : '=',
            modeltype : '=',
            isCreateNewMode : '=',
            disableForm : '=',
            ngModel : '=',
            functions : '='
		},
        templateUrl: 'directive/common/menuBar/menuBar.html',
		controller: 'MenuBarCtrl',
	};
});


angular.module('unionvmsWeb')
    .controller('MenuBarCtrl', function($scope, searchService, searchUtilsService, SearchField){
    //Set form partial depending on modelType
    switch($scope.modeltype) {
        case "VESSEL":
            $scope.formPartial = 'directive/common/menuBar/vessel/vesselMenuBar.html';
            break;
        case "MOBILE_TERMINAL":
            $scope.formPartial = 'directive/common/menuBar/mobileTerminal/mobileTerminalMenuBar.html';
            break;
        default:
            console.error("ModelType is missing for menu bar. " + $scope.modeltype);
    }

    $scope.includeSaveUpdate = angular.isDefined($scope.functions.saveCallback) && angular.isDefined($scope.functions.updateCallback);
    $scope.includeCSVDownload = angular.isDefined($scope.functions.exportToCsvCallback);
    $scope.includeArchive = angular.isDefined($scope.functions.archiveCallback);
    $scope.includeHistory = angular.isDefined($scope.functions.historyCallback);
    $scope.includeUnlink = angular.isDefined($scope.functions.unlinkCallback);

});
