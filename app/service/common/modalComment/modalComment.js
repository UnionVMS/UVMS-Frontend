var app = angular.module('unionvmsWeb');

app.controller('modalCommentCtrl', function($scope, $modalInstance, options, locale) {

	$scope.comment = "";
	$scope.labels = {
		title: options.titleLabel || locale.getString("common.comment"),
		save: options.saveLabel || locale.getString("common.save"),
		cancel: options.cancelLabel || locale.getString("common.cancel"),
		placeholder: options.placeholderLabel || locale.getString("common.comment_placeholder")
	};

	$scope.save = function() {
		$modalInstance.close($scope.comment);
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
				resolve: {
					options: function() {
						return options || {};
					}
				}
			}).result.then(callback);
		}
	};
});
