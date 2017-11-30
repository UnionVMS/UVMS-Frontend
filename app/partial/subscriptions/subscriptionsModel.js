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
angular.module('unionvmsWeb').factory('Subscription', function (locale) {
	function Subscription() {
		this.name = undefined;
		this.isActive = undefined;
		this.organization = undefined;
		this.subscriptionType = undefined;
		this.accessibility = undefined;
		this.endPoint = undefined;
		this.description = undefined;
		this.commChannel = undefined;
		this.retryDelay = undefined;
		this.messageType = undefined;
		this.trigger = undefined;
		this.validFrom = undefined;
		this.validUntil = undefined;
		this.vesselsSelection = [];
	}

	Subscription.prototype.fromJson = function (data) {
		this.name = data.name;
		this.isActive = data.isActive;
		this.organization = data.organization;
		this.subscriptionType = data.subscriptionType;
		this.accessibility = data.accessibility;
		this.endPoint = data.endPoint;
		this.description = data.description;
		this.commChannel = data.commChannel;
		this.retryDelay = data.retryDelay;
		this.trigger = data.trigger;
		this.validFrom = data.validFrom;
		this.validUntil = data.validUntil;
		this.messageType = data.messageType;

	}
	return Subscription;
});

