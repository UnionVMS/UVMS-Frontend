angular.module('unionvmsWeb').controller('MapsettingscollapsiblepanelCtrl',function($scope){

	$scope.status = {
		isOpen: false
	};
	
	$scope.test = function(){
	    console.log($scope.configModel);
	};

});