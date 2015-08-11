angular.module('unionvmsWeb')
.factory('Exchange', function(){

	function Exchange(){
		this.dateForward = undefined;
		this.dateRecieved = undefined;
		this.forwardRule = undefined;
		this.id = undefined;
		this.message = undefined;
		this.recipient = undefined;
		this.sentBy = undefined;		
		this.status = undefined;
	}

	Exchange.fromJson = function(data){
		var exchange = new Exchange();
		
		if(data){
			exchange.forwardRule = data.forwardRule;
			exchange.dateRecieved = data.dateRecieved;
			exchange.dateForward = data.dateForward;
			exchange.id = data.id;
			exchange.message = data.message;
			exchange.recipient = data.recipient;
			exchange.sentBy = data.sentBy;		
			exchange.status = data.status;
		}

		return exchange;
	};

    Exchange.prototype.getFormattedDateRecieved = function() {
        return moment(this.dateRecieved).format("YYYY-MM-DD HH:mm");
    };

    Exchange.prototype.getFormattedDateForward = function() {
        return moment(this.dateForward).format("YYYY-MM-DD HH:mm");
    };

    return Exchange;

});