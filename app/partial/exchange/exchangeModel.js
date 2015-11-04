angular.module('unionvmsWeb')
.factory('Exchange', function(){





	function Exchange(){

		this.dateForward = undefined;
		this.dateRecieved = undefined;
		this.id = undefined;
		this.incoming = undefined;
		this.forwardRule = undefined;
		this.recipient = undefined;
		this.source = undefined;
		this.status = undefined;
		this.senderRecipient = undefined;
	}

	Exchange.fromJson = function(data){
		var exchange = new Exchange();

		if(data){
			exchange.dateForward = data.dateFwd;
			exchange.dateRecieved = data.dateRecieved;
			exchange.id = data.id;
			exchange.incoming = data.incoming || false;
			exchange.forwardRule = data.rule;
			exchange.recipient = data.senderRecipient;
			exchange.source = data.source;
			exchange.status = data.status;
			exchange.senderRecipient = data.senderRecipient;
		}

		if (exchange.status === "SUCCESSFULL") {
			exchange.status = "SUCCESSFUL";
		}

		if (exchange.status === "FAILED") {
			exchange.status = "ERROR";
		}

		return exchange;
	};

    Exchange.prototype.getFormattedDateRecieved = function() {
        return moment(this.dateRecieved).format("YYYY-MM-DD HH:mm");
    };

    Exchange.prototype.getFormattedDateForward = function() {
        return moment(this.dateForward).format("YYYY-MM-DD HH:mm");
    };

    Exchange.prototype.isEqualExchange = function(item) {
        return angular.isDefined(item) && item.id === this.id;
    };

    return Exchange;

});