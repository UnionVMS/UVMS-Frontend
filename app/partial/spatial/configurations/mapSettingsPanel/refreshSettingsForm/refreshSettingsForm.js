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