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
angular.module('unionvmsWeb').controller('RefreshsettingsformCtrl',function($scope){
	$scope.getNrErrors = function(){
		var nrErrors = 0;
		if (angular.isDefined($scope.refreshSettingsForm)){
			angular.forEach(_.allKeys($scope.refreshSettingsForm.$error), function(item){
				nrErrors += $scope.refreshSettingsForm.$error[item].length;
			});
		}
		return nrErrors;
	};
	
	$scope.validateRefreshRate = function(){
		if($scope.configModel.mapSettings && $scope.configModel.mapSettings.refreshStatus === true){
			if($scope.configModel.mapSettings && ($scope.configModel.mapSettings.refreshRate === null || $scope.configModel.mapSettings.refreshRate === undefined)){
				$scope.refreshSettingsForm.refreshRate.$setValidity('requiredField', false);
			}else{
				$scope.refreshSettingsForm.refreshRate.$setValidity('requiredField', true);
			}
			if($scope.configModel.mapSettings && $scope.configModel.mapSettings.refreshRate !== null && $scope.configModel.mapSettings.refreshRate < 1){
				$scope.refreshSettingsForm.refreshRate.$setValidity('minField', false);
			}else{
				$scope.refreshSettingsForm.refreshRate.$setValidity('minField', true);
			}
		}
	};
	
	$scope.$watch('configModel.mapSettings.refreshStatus', function(newVal){
		if(newVal === true && angular.isDefined($scope.refreshSettingsForm) && angular.isDefined($scope.refreshSettingsForm.refreshRate)){
			$scope.validateRefreshRate();
		}else if(angular.isDefined($scope.refreshSettingsForm) && angular.isDefined($scope.refreshSettingsForm.refreshRate)){
			$scope.refreshSettingsForm.refreshRate.$setValidity('requiredField', true);
			$scope.refreshSettingsForm.refreshRate.$setValidity('minField', true);
		}
	});
});
