angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll){

	$scope.isConfigVisible= false;

	$scope.toggleUserPreferences = function(){
		$scope.isConfigVisible = !$scope.isConfigVisible;
		$anchorScroll();

		//Call function from parent to toggle menu visibility
		$scope.toggleMenuVisibility();

		if($scope.isConfigVisible === false){
			$scope.$emit('closeUserPreferences', $scope.previousSelection)
		}
	};

	$scope.$on('loadUserPreferences', function(serviceName, previousSelection){
		$scope.toggleUserPreferences();
		$scope.previousSelection = previousSelection;
	});

});