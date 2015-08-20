angular.module('unionvmsWeb')
.factory('Exchange', function(){

	function Exchange(){
		this.dateForward = undefined;
		this.dateRecieved = undefined;
		this.forwardRule = undefined;
		this.id = undefined;
		this.message = undefined;
		this.outgoung = undefined;
		this.recipient = undefined;
		this.sentBy = undefined;		
		this.status = undefined;
	}

	Exchange.fromJson = function(data){
		var exchange = new Exchange();
		
		if(data){
			exchange.forwardRule = data.fwdRule;
			exchange.dateRecieved = data.dateRecieved;
			exchange.dateForward = data.dateFwd;
			exchange.id = data.id;
			exchange.message = data.message;
			exchange.outgoing = data.outgoing || false;
			exchange.recipient = data.recipient;
			exchange.sentBy = data.sentBy;		
			exchange.status = data.status;
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