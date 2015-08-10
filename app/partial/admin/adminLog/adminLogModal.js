angular.module('unionvmsWeb').controller('AuditLogModalCtrl', function($scope, $modalInstance, auditInstance) {

	$scope.dismiss = function() {
		$modalInstance.dismiss();
	};

	$scope.auditInstance = auditInstance;

});

angular.module('unionvmsWeb').factory('AuditLogModal', function($modal) {
	return {
		show: function(auditInstance) {
			return $modal.open({
				templateUrl: 'partial/audit/auditLog/auditLogModal.html',
				controller: 'AuditLogModalCtrl',
				size: 'md',
				resolve: {
					auditInstance: function() {
						return auditInstance;
					}
				}
            }).result;
		}
	};
});