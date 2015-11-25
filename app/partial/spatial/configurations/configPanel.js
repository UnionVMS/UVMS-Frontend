angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll, SpatialConfig){

	$scope.isConfigVisible= false;
	$scope.configModel = new SpatialConfig();
	
	$scope.toggleUserPreferences = function(){
		$scope.isConfigVisible = !$scope.isConfigVisible;
		$anchorScroll();

		//Call function from parent to toggle menu visibility
		$scope.toggleMenuVisibility();

		if($scope.isConfigVisible === false){
			$scope.$emit('closeUserPreferences', $scope.previousSelection);
		}
	};

	$scope.$on('loadUserPreferences', function(serviceName, previousSelection){
		$scope.toggleUserPreferences();
		$scope.previousSelection = previousSelection;
	});
});