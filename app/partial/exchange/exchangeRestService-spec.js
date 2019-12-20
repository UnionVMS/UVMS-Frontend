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
describe('exchangeRestService', function() {

    beforeEach(module('unionvmsWeb'));

    var doErrorCallback = function(callback){
        callback({
            code : 500,
        });
    };

    //MOCK RESOURCE
    beforeEach(function () {
        var mockResource = {
            //List of transmission statuses
            getTransmissionStatuses: function() {
                return {
                    get: function(getObject, callback) {
                        callback({
                            code : 200,
                            data: [
                                {id: 'a'},
                                {id: 'b'}
                            ]
                        });
                    },
                }
            },
            stopTransmission: function() {
                return {
                    stop: function(params, getObject, callback) {
                        //Success if serviceClassName is defined, 500 otherwize
                        if(angular.isDefined(params.serviceClassName)){
                            callback({
                                code : 200,
                                data: {
                                }
                            });
                        }else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            startTransmission: function() {
                return {
                    start: function(params, getObject, callback) {
                        //Success if serviceClassName is defined, 500 otherwize
                        if(angular.isDefined(params.serviceClassName)){
                            callback({
                                code : 200,
                                data: {
                                }
                            });
                        }else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            //List of exchange logs
            getExchangeMessages: function() {
                return {
                    list: function(getListRequest, callback) {
                        //Success if page = 1, otherwize return 500
                        if(getListRequest.pagination.page === 1){
                            callback({
                                code : 200,
                                data: {
                                    logList: [
                                        {
                                            id: "1",
                                        },
                                        {
                                            id: "2",
                                        }
                                    ],
                                    currentPage : 12,
                                    totalNumberOfPages : 23
                                }
                            });
                        }
                        else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            getPollMessages: function() {
                return {
                    list: function(getListRequest, callback) {
                        //Success if searchObj.status is defined otherwize return 500
                        if(angular.isDefined(getListRequest.status)){
                            callback({
                                code : 200,
                                data: [
                                    {
                                        id: "1",
                                    },
                                    {
                                        id: "2",
                                    }
                                ]
                            });
                        }
                        else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            getPollMessage: function() {
                return {
                    get: function(getObject, callback) {
                        if(angular.isDefined(getObject.typeRefGuid)){
                            callback({
                                code : 200,
                                data: {id: 'a'}
                            });
                        }else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            sendQueuedMessages: function() {
                return {
                    put: function(ids, callback) {
                        if(ids.length > 0){
                            callback({
                                code : 200,
                                data: {id: 'a'}
                            });
                        }else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            getExchangeMessage: function() {
                return {
                    get: function( getObject, callback) {
                        //Success if guid is defined, 500 otherwize
                        if(angular.isDefined(getObject.guid)){
                            callback({
                                code : 200,
                                data: {
                                    id: 'a'
                                }
                            });
                        }else{
                            doErrorCallback(callback);
                        }
                    },
                }
            },
            //Config
            getExchangeConfig: function() {
                return {
                    get: function(callback) {
                        callback({
                            code : 200,
                            data: {id : 'a'}
                        });
                    },
                }
            },
        };

        module(function ($provide) {
            $provide.value('exchangeRestFactory', mockResource);
        });

    });

    beforeEach(inject(function($httpBackend) {
        httpBackend = $httpBackend;
        //Mock
        httpBackend.whenGET(/usm/).respond();
        httpBackend.whenGET(/i18n/).respond();
        httpBackend.whenGET(/globals/).respond({data : []});
    }));

    describe('getTransmissionStatuses', function() {
        it("getTransmissionStatuses should send request to backend and return received object", inject(function($rootScope, exchangeRestService, ExchangeService) {
            var resolved = false;
            exchangeRestService.getTransmissionStatuses().then(function(services){
                resolved = true;
                expect(services.length).toEqual(2);
                expect(services[0] instanceof ExchangeService).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


    });

    describe('stopTransmission', function() {
        it("stopTransmission should send request to backend and return received object", inject(function($rootScope, exchangeRestService) {
            var resolved = false;
            exchangeRestService.stopTransmission("serviceClassName").then(function(){
                resolved = true;
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("stopTransmission should reject promise in case of error", inject(function($rootScope, exchangeRestService) {
            var rejected = false;
            exchangeRestService.stopTransmission().then(function(){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('startTransmission', function() {
        it("startTransmission should send request to backend and return received object", inject(function($rootScope, exchangeRestService) {
            var resolved = false;
            exchangeRestService.startTransmission("serviceClassName").then(function(){
                resolved = true;
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("startTransmission should reject promise in case of error", inject(function($rootScope, exchangeRestService) {
            var rejected = false;
            exchangeRestService.startTransmission().then(function(){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getMessages', function() {
        it("getMessages should return list of exchange logs", inject(function($rootScope, exchangeRestService, GetListRequest, Exchange) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            exchangeRestService.getMessages(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(12);
                expect(page.totalNumberOfPages).toEqual(23);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof Exchange).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getMessages should reject promise in case of error", inject(function($rootScope, exchangeRestService, GetListRequest) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            exchangeRestService.getMessages(getListRequest).then(function(page){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));

    });

    describe('getPollMessage', function() {
        it("getPollMessage should return an exchange poll log", inject(function($rootScope, exchangeRestService,ExchangePoll) {
            var resolved = false;
            exchangeRestService.getPollMessage("TEST_REF_ID").then(function(exchangePoll){
                resolved = true;
                expect(exchangePoll instanceof ExchangePoll).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getPollMessage should reject promise in case of error", inject(function($rootScope, exchangeRestService) {

            var rejected = false;
            exchangeRestService.getPollMessage().then(function(exchangePoll){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getPollMessages', function() {
        it("getPollMessages should return list of exchange poll logs", inject(function($rootScope, exchangeRestService, GetListRequest, ExchangePoll) {
            var getListRequest = new GetListRequest();
            getListRequest.addSearchCriteria("STATUS","TEST");

            var resolved = false;
            exchangeRestService.getPollMessages(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(1);
                expect(page.totalNumberOfPages).toEqual(1);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof ExchangePoll).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getPollMessages should reject promise in case of error", inject(function($rootScope, exchangeRestService, GetListRequest) {
            var getListRequest = new GetListRequest();

            var rejected = false;
            exchangeRestService.getPollMessages(getListRequest).then(function(page){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('sendQueue', function() {
        it("sendQueue should send request to server and resolve", inject(function($rootScope, exchangeRestService) {
            var messageIds = ['a','b'];

            var resolved = false;
            exchangeRestService.sendQueue(messageIds).then(function(){
                resolved = true;
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("sendQueue should reject promise in case of error", inject(function($rootScope, exchangeRestService) {
            var messageIds = [];

            var rejected = false;
            exchangeRestService.sendQueue(messageIds).then(function(){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });


    describe('getExchangeMessage', function() {
        it("getExchangeMessage should return an exchange log", inject(function($rootScope, exchangeRestService, Exchange) {
            var resolved = false;
            exchangeRestService.getExchangeMessage("TEST_GUID").then(function(exchangeLog){
                resolved = true;
                expect(exchangeLog instanceof Exchange).toBeTruthy('Should be an Exchange object');
            });
            $rootScope.$digest();
            expect(resolved).toBe(true, "Shoud have resolved");

        }));


        it("getExchangeMessage should reject promise in case of error", inject(function($rootScope, exchangeRestService) {
            var rejected = false;
            exchangeRestService.getExchangeMessage().then(function(exchangeLog){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });


    describe('getExchangeConfig', function() {
        it("getExchangeConfig should return data", inject(function($rootScope, exchangeRestService) {
            var resolved = false;
            exchangeRestService.getExchangeConfig().then(function(configObject){
                resolved = true;
                expect(angular.isDefined(configObject));
            });
            $rootScope.$digest();
            expect(resolved).toBe(true, "Shoud have resolved");

        }));
    });
});