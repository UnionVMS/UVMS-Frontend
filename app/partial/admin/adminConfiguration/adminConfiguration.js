angular.module('unionvmsWeb').controller('AuditconfigurationCtrl',function($scope){
	$scope.isAudit = false;
	$scope.activeTab = "GENERAL";

	$scope.setTab = function(tab){
		$scope.activeTab = tab;
	};

});