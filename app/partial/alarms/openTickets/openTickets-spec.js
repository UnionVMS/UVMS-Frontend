describe('OpenticketsCtrl', function() {

    var scope, createController, longpollingSpy;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller, longPolling) {
        scope = $rootScope.$new();

        longpollingSpy = spyOn(longPolling, 'poll');

        createController = function(){
            return $controller('OpenticketsCtrl', {$scope: scope});
        };

    }));


    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));


    it('should start longPolling on init ', inject(function($rootScope) {
        var controller = createController();

        expect(longpollingSpy).toHaveBeenCalledWith("/rules/activity/ticket", jasmine.any(Object));
    }));


/*    it('filterOnStatus should return true if status of alarm matches the filter', inject(function($rootScope, Ticket) {
        var controller = createController();

        //Create an ticket
        var ticket = new Ticket();
        ticket.status = "OPEN";

        //Filter should be all from start
        expect(scope.statusFilter).toEqual('all');
        expect(scope.filterOnStatus(ticket)).toBeTruthy();

        scope.statusFilter = 'open'
        expect(scope.filterOnStatus(ticket)).toBeTruthy();

        scope.statusFilter = 'closed'
        expect(scope.filterOnStatus(ticket)).toBeFalsy();
    }));*/

    describe('search alarms', function() {
        it('resetSearch should broadcast resetAlarmSearch event', inject(function($rootScope, longPolling, $q) {
            var broadcastSpy = spyOn($rootScope, '$broadcast');
            var controller = createController();

            scope.resetSearch();

            expect(broadcastSpy).toHaveBeenCalledWith('resetAlarmSearch');
        }));

        it('searchTickets should reset newTicketsCount', inject(function($rootScope, Alarm) {
            var controller = createController();
            scope.newTicketsCount = 5;
            scope.searchTickets();
            expect(scope.newTicketsCount).toEqual(0);
        }));

        it('searchTickets should get alarms from the server', inject(function($rootScope, $q, Ticket, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchTickets").andReturn(deferred.promise);
            var ticket = new Ticket();
            ticket.guid = "ABCD-123";
            var items = [ticket];
            var results = new SearchResultListPage(items, 1, 10);
            deferred.resolve(results);

            var controller = createController();

            scope.searchTickets();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(ticket);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('searchTickets should handle search error', inject(function($rootScope, $q, searchService, locale, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchTickets").andReturn(deferred.promise);
            var searchSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            scope.searchTickets();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchTickets").andReturn(deferred.promise);
            var setPageSpy = spyOn(searchService, "setPage");
            deferred.reject();

            var controller = createController();

            var page = 4;
            scope.gotoPage(page);
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();

            expect(setPageSpy).toHaveBeenCalledWith(page);
            expect(searchSpy).toHaveBeenCalled();
        }));
    });

    it('showOnMap should open modal for viewing the ticket', inject(function($rootScope, Ticket, TicketModal, $q) {
        var mockModalInstance = {
            dismiss: function() {},
            result: $q.when({
                isClosed: function() {
                    return false;
                }
            })
        };

        var modalSpy = spyOn(TicketModal, "show").andReturn(mockModalInstance);

        var controller = createController();

        //Create a ticket
        var ticket = new Ticket();
        scope.showOnMap(ticket);
        expect(modalSpy).toHaveBeenCalled();
    }));

    it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
        var controller = createController();
        var alertSpy = spyOn(alertService, "hideMessage");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
    }));

    it('exportItemsAsCSVFile should call service for exporting to csv file', inject(function(Ticket, csvService) {
        var controller = createController();

        //Create fake result
        var ticket = new Ticket();
        scope.currentSearchResults.items.push(ticket);

        var csvSpy = spyOn(csvService, "downloadCSVFile").andCallFake(function(data, header, filename){
            expect(filename).toEqual('notifications.csv');
            expect(data.length).toEqual(1);
            expect(header.length).toBeGreaterThan(1, "Should be at least 1 column");
            expect(header.length).toEqual(data[0].length, "Header and data should have equal number of columns");
        });

        scope.exportItemsAsCSVFile(false);

        expect(csvSpy).toHaveBeenCalled();
    }));
});

