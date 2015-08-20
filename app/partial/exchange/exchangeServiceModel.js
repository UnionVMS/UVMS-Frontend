angular.module('unionvmsWeb')
.factory('ExchangeService', function(){

    function ExchangeService(){
        this.name = undefined;
        this.status = undefined;
    }

    ExchangeService.fromJson = function(data){
        var exchangeService = new ExchangeService();
        
        if(data){   
            exchangeService.name = data.name;
            exchangeService.status = data.status;
        }

        return exchangeService;
    };


    ExchangeService.prototype.isOnline = function() {
        return this.status === 'ONLINE';
    };

    ExchangeService.prototype.setAsStopped = function() {
        this.status ='OFFLINE';
    };

    ExchangeService.prototype.setAsStarted = function() {
        this.status ='ONLINE';
    };

    return ExchangeService;

});