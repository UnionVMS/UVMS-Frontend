angular.module('unionvmsWeb')
.factory('Exchange', function(){

	function Exchange(){

 		this.id = undefined;
        this.incoming = undefined;
        this.dateRecieved = undefined;
        this.senderRecipient = undefined;
        this.recipient = undefined;
        this.dateFwd = undefined;
        this.status = undefined;
        this.logData = undefined;
        this.forwardRue = undefined;
        this.source = undefined;
	}

	Exchange.fromJson = function(data){
		var exchange = new Exchange();

		if(data){
			exchange.id = data.id;
	        exchange.incoming = data.incoming || false;
	        exchange.dateRecieved = data.dateRecieved;
	        exchange.senderRecipient = data.senderRecipient;
	        exchange.recipient = data.recipient;
	        exchange.dateFwd = data.dateFwd;
	        exchange.status = data.status;
	        exchange.logData = data.logData;
			exchange.forwardRule = data.rule;
			exchange.source = data.source;

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