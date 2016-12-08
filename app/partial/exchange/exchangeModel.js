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
angular.module('unionvmsWeb')
.factory('Exchange', function(){

	function Exchange(){

 		this.id = undefined;
        this.incoming = undefined;
        this.dateReceived = undefined;
        this.senderRecipient = undefined;
        this.recipient = undefined;
        this.dateFwd = undefined;
        this.status = undefined;
        this.logData = undefined;
        this.forwardRule = undefined;
        this.source = undefined;
        this.type = undefined;
	}

	Exchange.fromJson = function(data){
		var exchange = new Exchange();

		if(data){
			exchange.id = data.id;
	        exchange.incoming = data.incoming || false;
	        exchange.dateReceived = data.dateRecieved;
	        exchange.senderRecipient = data.senderRecipient;
	        exchange.recipient = data.recipient;
	        exchange.dateFwd = data.dateFwd;
	        exchange.status = data.status;
	        exchange.logData = data.logData;
			exchange.forwardRule = data.rule;
            exchange.source = data.source;
			exchange.type = data.type;

		}

		if (exchange.status === "SUCCESSFULL") {
			exchange.status = "SUCCESSFUL";
		}

		if (exchange.status === "FAILED") {
			exchange.status = "ERROR";
		}

		return exchange;
	};

    Exchange.prototype.isEqualExchange = function(item) {
        return angular.isDefined(item) && item.id === this.id;
    };

    return Exchange;

});