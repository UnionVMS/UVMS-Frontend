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