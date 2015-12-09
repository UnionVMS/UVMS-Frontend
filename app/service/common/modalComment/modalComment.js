var app = angular.module('unionvmsWeb');

app.controller('modalCommentCtrl', function($scope, $modalInstance, options, locale) {
    $scope.submitAttempted = false;
	$scope.comment = "";
	$scope.labels = {
		title: options.titleLabel || locale.getString("common.comment"),
		save: options.saveLabel || locale.getString("common.save"),
		cancel: options.cancelLabel || locale.getString("common.cancel"),
		placeholder: options.placeholderLabel || locale.getString("common.comment_modal_comment_placeholder")
	};

	$scope.save = function() {
        $scope.submitAttempted = true;
        if($scope.commentForm.$valid) {
            $modalInstance.close($scope.comment);
        }
	};

	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
});

app.factory('modalComment', function($modal) {
	return {
		open: function(callback, options) {
			$modal.open({
				templateUrl: "service/common/modalComment/modalComment.html",
				controller: "modalCommentCtrl",
                backdrop: 'static', //will not close when clicking outside the modal window
				resolve: {
					options: function() {
						return options || {};
					}
				}
			}).result.then(callback);
		}
	};
});
