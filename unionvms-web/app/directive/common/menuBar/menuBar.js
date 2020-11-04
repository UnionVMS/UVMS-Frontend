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
        default:
            console.error("ModelType is missing for menu bar. " + $scope.modeltype);
    }

    $scope.includeSaveUpdate = function() {
        if (angular.isDefined($scope.functions.saveCallback && $scope.functions.updateCallback && $scope.functions.showSave)) {
            return $scope.functions.showSave($scope.ngModel);
        }
    };
    $scope.includeCSVDownload = function() {
        if (angular.isDefined($scope.functions.exportToCsvCallback && $scope.functions.showExport)) {
            return $scope.functions.showExport($scope.ngModel);
        }
    };
    $scope.includeArchive = function() {
        if (angular.isDefined($scope.functions.archiveCallback && $scope.functions.showArchive)) {
            return $scope.functions.showArchive($scope.ngModel);
        }
    };
    $scope.includeHistory = function() {
        if (angular.isDefined($scope.functions.historyCallback && $scope.functions.showHistory)) {
            return $scope.functions.showHistory($scope.ngModel);
        }
    };
    $scope.includeUnlink = function() {
        if (angular.isDefined($scope.functions.unlinkCallback && $scope.functions.showUnlink)) {
            return $scope.functions.showUnlink($scope.ngModel);
        }
    };
    $scope.includeRemove = function() {
        if (angular.isDefined($scope.functions.removeCallback && $scope.functions.showRemove)) {
            return $scope.functions.showRemove($scope.ngModel);
        }
    };
    $scope.includeCancel = function() {
        if (angular.isDefined($scope.functions.cancelCallback && $scope.functions.showCancel)) {
            return $scope.functions.showCancel($scope.ngModel);
        }
    };

});
