/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
			scope.showRecipient = showElement(scope.items[0].recipient);
			scope.showPlugin = showElement(scope.items[0].plugin);

			scope.resendQueuedItemInGroup = function(itemid){
				scope.$parent.resendQueuedItemInGroup(itemid);
			};
		}

	};
});