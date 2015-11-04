angular.module('unionvmsWeb')
.factory('ExchangeService', function(){

    function ExchangeService(){
    this.name = undefined;
    this.serviceClassName = undefined;
    this.status = undefined;
    this.type = undefined;
    }

    ExchangeService.fromJson = function(data){
        var exchangeService = new ExchangeService();

        if(data){
            exchangeService.name = data.name;
            exchangeService.serviceClassName = data.serviceClassName;
            exchangeService.status = data.status;
            exchangeService.type = data.type;
        }

        return exchangeService;
    };


    ExchangeService.prototype.isOnline = function() {
        return this.status === 'STARTED';
    };

    ExchangeService.prototype.isUnkown = function() {
        return this.status === 'UNKOWN';
    };

    ExchangeService.prototype.setAsStopped = function() {
        this.status ='STOPPED';
    };

    ExchangeService.prototype.setAsStarted = function() {
        this.status ='STARTED';
    };

    return ExchangeService;

});