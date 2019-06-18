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
describe('alarmRestService', function() {

    beforeEach(module('unionvmsWeb'));

    //MOCK RESOURCE
    beforeEach(function () {
        var mockResource = {
            alarm: function() {
                return {
                    update: function(alarmDTO, callback) {
                        //Success if status is defined, 500 otherwize
                        if(angular.isDefined(alarmDTO.status)){
                            callback({
                                    status : 'CLOSED'
                            } , undefined, 200);
                        }else{
                            callback({}, undefined, 500);
                        }
                    },
                }
            },
            ticketStatus: function() {
                return {
                    update: function(alarmDTO, callback) {
                        //Success if status is defined, 500 otherwize
                        if(angular.isDefined(alarmDTO.status)){
                            callback({
                                    status : 'CLOSED'
                                	}, undefined, 200);
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            //List of alarms
            getAlarms: function() {
                return {
                    list: function(getListRequest, callback) {
                        //Success if page = 1, otherwize return 500
                        if(getListRequest.pagination.page === 1){
                            callback({
                                    alarmList: [
                                        {
                                            id: "1",
                                            status : 'CLOSED'
                                        },
                                        {
                                            id: "2",
                                            status : 'OPEN'
                                        }
                                    ],
                                    currentPage : 12,
                                    totalNumberOfPages : 23
                            }, undefined, 200);
                        }
                        else{
                            callback({}, undefined, 500);
                        }
                    },
                }
            },
            //List of tickets
            getTickets: function() {
                return {
                    list: function(userName, getListRequest, callback) {
                        //Success if page = 1, otherwize return 500
                        if(getListRequest.pagination.page === 1){
                            callback({
                                    tickets: [
                                        {
                                            guid: "1",
                                            status : 'CLOSED'
                                        },
                                        {
                                            guid: "2",
                                            status : 'OPEN'
                                        }
                                    ],
                                    currentPage : 12,
                                    totalNumberOfPages : 23
                                } , undefined, 200);
                        }
                        else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            getAlarm: function() {
                return {
                    get: function(idObject, callback) {
                        //Success if guid is defined, 500 otherwize
                        if(angular.isDefined(idObject.guid)){
                            callback({
                                    id : idObject.guid,
                                    status : 'CLOSED'
                            }, undefined, 200);
                        }else{
                            callback({}, undefined, 500);
                        }
                    },
                }
            },
            getTicket: function() {
                return {
                    get: function(idObject, callback) {
                        //Success if guid is defined, 500 otherwize
                        if(angular.isDefined(idObject.guid)){
                            callback({
                                    guid : idObject.guid,
                                    status : 'CLOSED'
                                }, undefined, 200);
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            getOpenTicketsCount: function() {
                return {
                    getText: function(idObject, callback) {
                        callback({content: 5, code: 200});
                    },
                }
            },
            getOpenAlarmsCount: function() {
                return {
                    getText: function(idObject, callback) {
                        callback({content: 3, code: 200});
                    },
                }
            },
        };

        module(function ($provide) {
            $provide.value('alarmRestFactory', mockResource);
        });

    });

    beforeEach(inject(function($httpBackend) {
        httpBackend = $httpBackend;
        //Mock
        httpBackend.whenGET(/usm/).respond();
        httpBackend.whenGET(/i18n/).respond();
        httpBackend.whenGET(/globals/).respond({data : []});
    }));

    describe('updateAlarmStatus', function() {
        it("updateAlarmStatus should send request to backend and return received object", inject(function($rootScope, alarmRestService, Alarm) {
            var alarm = new Alarm();
            alarm.status = "CLOSED";

            var resolved = false;
            alarmRestService.updateAlarmStatus(alarm).then(function(updatedAlarm){
                resolved = true;
                expect(updatedAlarm.status).toEqual(alarm.status);
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("updateAlarmStatus should reject promise in case of error", inject(function($rootScope, alarmRestService, Alarm) {
            var alarm = new Alarm();
            alarm.status = undefined;

            var rejected = false;
            alarmRestService.updateAlarmStatus(alarm).then(function(updatedAlarm){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });


    describe('getAlarmsList', function() {
        it("getAlarmsList should return list of alarms", inject(function($rootScope, alarmRestService, GetListRequest, Alarm) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            alarmRestService.getAlarmsList(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(12);
                expect(page.totalNumberOfPages).toEqual(23);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof Alarm).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getAlarmsList should reject promise in case of error", inject(function($rootScope, alarmRestService, GetListRequest, Alarm) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            alarmRestService.getAlarmsList(getListRequest).then(function(page){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });


    describe('getTicketsListForCurrentUser', function() {
        it("getTicketsListForCurrentUser should return list of tickets", inject(function($rootScope, alarmRestService, GetListRequest, Ticket) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            alarmRestService.getTicketsListForCurrentUser(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(12);
                expect(page.totalNumberOfPages).toEqual(23);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof Ticket).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));

        it("getTicketsListForCurrentUser should reject promise in case of error", inject(function($rootScope, alarmRestService, GetListRequest, Alarm) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            alarmRestService.getTicketsListForCurrentUser(getListRequest).then(function(page){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);
        }));
    });


    describe('updateTicketStatus', function() {
        it("updateTicketStatus should send request to backend and return received object", inject(function($rootScope, alarmRestService, Ticket) {
            var ticket = new Ticket();
            ticket.status = "CLOSED";

            var resolved = false;
            alarmRestService.updateTicketStatus(ticket).then(function(updatedAlarm){
                resolved = true;
                expect(updatedAlarm.status).toEqual(ticket.status);
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("updateTicketStatus should reject promise in case of error", inject(function($rootScope, alarmRestService, Ticket) {
            var ticket = new Ticket();
            ticket.status = undefined;

            var rejected = false;
            alarmRestService.updateTicketStatus(ticket).then(function(updatedAlarm){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });



    describe('getAlarmReport', function() {
        it("getAlarmReport should send request to backend and return received object", inject(function($rootScope, alarmRestService, Ticket) {
            var guid = "ABC123";

            var resolved = false;
            alarmRestService.getAlarmReport(guid).then(function(alarm){
                resolved = true;
                expect(alarm.id).toEqual(guid);
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("getAlarmReport should reject promise in case of error", inject(function($rootScope, alarmRestService, Ticket) {
            var guid = undefined;
            var rejected = false;
            alarmRestService.getAlarmReport(guid).then(function(alarm){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });


    describe('getOpenTicketsCount', function() {
        it("getOpenTicketsCount should send request to backend and return received object", inject(function($rootScope, alarmRestService) {
            var resolved = false;
            alarmRestService.getOpenTicketsCount().then(function(count){
                resolved = true;
                expect(count).toBe(5);
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));
    });


    describe('getOpenAlarmsCount', function() {
        it("getOpenAlarmsCount should send request to backend and return received object", inject(function($rootScope, alarmRestService) {
            var resolved = false;
            alarmRestService.getOpenAlarmsCount().then(function(count){
                resolved = true;
                expect(count).toBe(3);
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));
    });

});