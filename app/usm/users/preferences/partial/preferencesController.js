var userContextsModule = angular.module('preferences');

userContextsModule.controller('PreferencescontrollerCtrl', ['$scope', '$stateParams',
	function ($scope, $stateParams) {
		$scope.isDataLoading = true;  
		$scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";
	}
]);
