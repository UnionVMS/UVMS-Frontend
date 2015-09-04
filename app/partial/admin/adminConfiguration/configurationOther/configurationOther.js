angular.module('unionvmsWeb').controller('ConfigurationotherCtrl',function($scope){

	$scope.mandatoryPolling = false;
	$scope.restrictSampling = true;

	$scope.toogleMandatory = function(status){
		$scope.mandatoryPolling = status;
	};

	$scope.toogleRestrict = function(status){
		$scope.restrictSampling = status;
	};


});