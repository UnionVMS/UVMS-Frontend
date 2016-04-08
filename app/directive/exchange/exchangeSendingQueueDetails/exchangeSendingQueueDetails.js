angular.module('unionvmsWeb').directive('exchangeSendingQueueDetails', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			items : "="
		},
		templateUrl: 'directive/exchange/exchangeSendingQueueDetails/exchangeSendingQueueDetails.html',
		link: function(scope, element, attrs, fn, locale) {

			var showElement = function(item){
				return angular.isDefined(item);
			};

			//Hide elements in table if not defined.
			scope.showDateReceived = showElement(scope.items[0].dateReceived);
			scope.showSenderRecipient = showElement(scope.items[0].senderRecipient);
			scope.showAssetName = showElement(scope.items[0].ASSET_NAME);
			scope.showLongitude = showElement(scope.items[0].LONGITUDE);
			scope.showIRCS = showElement(scope.items[0].IRCS);
			scope.showLatitude = showElement(scope.items[0].LATITUDE);
			scope.showPositionTime = showElement(scope.items[0].POSITION_TIME);
			scope.showEmail = showElement(scope.items[0].EMAIL);

			scope.resendQueuedItemInGroup = function(itemid){
				scope.$parent.resendQueuedItemInGroup(itemid);
			};
		}

	};
});
