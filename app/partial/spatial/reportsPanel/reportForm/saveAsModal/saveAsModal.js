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
angular.module('unionvmsWeb').controller('SaveasmodalCtrl',function($scope,$uibModalInstance,reportData){
	$scope.report = reportData;
	$scope.report.nameCopy = $scope.report.name;
	$scope.report.descCopy = $scope.report.desc;
	
	$scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $scope.report = undefined;
    };

    $scope.save = function () {
        if ($scope.saveAsForm.$invalid){
        	delete $scope.report.nameCopy;
        	delete $scope.report.descCopy;
            return false;
        } else {
        	$scope.report.copy = true;
        	$scope.report.name = $scope.report.nameCopy;
        	$scope.report.desc = $scope.report.descCopy;
        	delete $scope.report.nameCopy;
        	delete $scope.report.descCopy;
            $uibModalInstance.close(angular.copy($scope.report));
            $scope.report = undefined;
        }
    };
});
