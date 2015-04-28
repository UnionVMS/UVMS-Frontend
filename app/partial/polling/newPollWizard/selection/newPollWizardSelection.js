angular.module('unionvmsWeb').controller('NewpollwizardselectionCtrl', function($scope, pollingService, MobileTerminalGroup, MobileTerminal, Vessel) {

	$scope.selection = pollingService.getSelection();

	$scope.remove = function(mobileTerminalGroup, mobileTerminal) {
		pollingService.removeMobileTerminalFromSelection(mobileTerminalGroup, mobileTerminal);
	};

	$scope.clear = function() {
		pollingService.clearSelection();
	};
});
