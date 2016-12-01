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
angular.module('unionvmsWeb').controller('AreagroupeditormodalCtrl',function($scope,$modalInstance,areaGroupName,areaRestService,loadingStatus,locale,unitConversionService,userService){
	$scope.alert = {};
	$scope.areaGroupName = areaGroupName;
	$scope.areaGroup = {
		type: areaGroupName
	};
	
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.save = function() {
		$scope.isSubmitted = true;
		if($scope.areaGroupActiveForm.$valid){
			$scope.isConfirming = true;
			$scope.alert.alertType = 'warning';
			if(userService.isAllowed('MANAGE_ANY_USER_AREA', 'Spatial', true)){
				$scope.alert.alertMessage = locale.getString('areas.confirm_area_group_edit_all');
			}else{
				$scope.alert.alertMessage = locale.getString('areas.confirm_area_group_edit');
			}
			$scope.alert.hasAlert = true;
		}
	};

	$scope.confirm = function() {
		if($scope.areaGroupActiveForm.$valid){
			loadingStatus.isLoading('EditAreaGroupModal',true);
			var obj = {
				startDate : unitConversionService.date.convertDate($scope.areaGroup.startDate, 'to_server'),
				endDate : unitConversionService.date.convertDate($scope.areaGroup.endDate, 'to_server'),
				type: areaGroupName
			};

			areaRestService.updateAreaGroupDate(obj).then(
				function (data) {
					loadingStatus.isLoading('EditAreaGroupModal',false);
					$modalInstance.close(locale.getString('areas.edit_area_group_success'));
				}, function(error) {
					$scope.alert.alertType = 'danger';
					$scope.alert.alertMessage = locale.getString('areas.edit_area_group_error');
					loadingStatus.isLoading('EditAreaGroupModal',false);
				}
			);
		}
	};
    
});
