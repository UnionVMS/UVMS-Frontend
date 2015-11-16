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
                                code : 200,
                                data: {
                                    status : 'CLOSED'
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            ticket: function() {
                return {
                    update: function(alarmDTO, callback) {
                        //Success if status is defined, 500 otherwize
                        if(angular.isDefined(alarmDTO.status)){
                            callback({
                                code : 200,
                                data: {
                                    status : 'CLOSED'
                                }
                            });
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
                                code : 200,
                                data: {
                                    alarms: [
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
                                }
                            });
                        }
                        else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            //List of tickets
            getTickets: function() {
                return {
                    list: function(getListRequest, callback) {
                        //Success if page = 1, otherwize return 500
                        if(getListRequest.pagination.page === 1){
                            callback({
                                code : 200,
                                data: {
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
                                }
                            });
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
                                code : 200,
                                data: {
                                    guid : idObject.guid,
                                    status : 'CLOSED'
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
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
                                code : 200,
                                data: {
                                    guid : idObject.guid,
                                    status : 'CLOSED'
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
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


    describe('getTicketsList', function() {
        it("getTicketsList should return list of tickets", inject(function($rootScope, alarmRestService, GetListRequest, Ticket) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            alarmRestService.getTicketsList(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(12);
                expect(page.totalNumberOfPages).toEqual(23);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof Ticket).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));

        it("getTicketsList should reject promise in case of error", inject(function($rootScope, alarmRestService, GetListRequest, Alarm) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            alarmRestService.getTicketsList(getListRequest).then(function(page){
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
                expect(alarm.guid).toEqual(guid);
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


    describe('getTicket', function() {
        it("getTicket should send request to backend and return received object with connected vessel data", inject(function($rootScope, $q, alarmRestService, Ticket, vesselRestService) {
            var vesselDeffered = $q.defer();
            vesselDeffered.resolve({vessel: {guid : 123}});
            vesselRestSpy = spyOn(vesselRestService, 'getVessel').andReturn(vesselDeffered.promise);

            var guid = "ABC123";

            var resolved = false;
            alarmRestService.getTicket(guid).then(function(ticket){
                resolved = true;
                expect(ticket.guid).toEqual(guid);
                expect(ticket.vessel).toBeDefined();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));

        it("getTicket should reject promise in case of vessel not found", inject(function($rootScope, $q, alarmRestService, Ticket, vesselRestService) {
            var vesselDeffered = $q.defer();
            vesselDeffered.reject("NOT_FOUND");
            vesselRestSpy = spyOn(vesselRestService, 'getVessel').andReturn(vesselDeffered.promise);

            var guid = "ABC123";

            var rejected = false;
            alarmRestService.getTicket(guid).then(function(ticket){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);
        }));

        it("getTicket should reject promise in case of error", inject(function($rootScope, alarmRestService, Ticket) {
            var guid = undefined;
            var rejected = false;
            alarmRestService.getTicket(guid).then(function(ticket){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

});