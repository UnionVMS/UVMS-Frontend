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
describe('ExchangeCtrl', function() {

	var scope,ctrl,longpollingSpy, sendingQueueSpy, pluginsSpy;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller, $q, longPolling, exchangeRestService) {
		scope = $rootScope.$new();

        longpollingSpy = spyOn(longPolling, 'poll');
        var deferred = $q.defer();
        sendingQueueSpy = spyOn(exchangeRestService, 'getSendingQueue').andReturn(deferred.promise);
        var deferred2 = $q.defer();
        pluginsSpy = spyOn(exchangeRestService, 'getTransmissionStatuses').andReturn(deferred2.promise);
		ctrl = $controller('ExchangeCtrl', {$scope: scope});
	}));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should start longPolling on init ', inject(function($rootScope) {
        //Long polling for plugins
        expect(longpollingSpy).toHaveBeenCalledWith("/exchange/activity/plugins", jasmine.any(Function));
        //Long polling for sending queue
        expect(longpollingSpy).toHaveBeenCalledWith("/exchange/activity/queue", jasmine.any(Function));
        //Long polling for exchange logs
        expect(longpollingSpy).toHaveBeenCalledWith("/exchange/activity/exchange", jasmine.any(Function));
    }));


    it('should get plugin statuses and sending queue on init ', inject(function($rootScope) {
        //plugins
        expect(pluginsSpy).toHaveBeenCalled();
        //sending queue
        expect(sendingQueueSpy).toHaveBeenCalled();
    }));


	it('should allow all messages when filter all', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "all";
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeTruthy();
	}));

	it('should only allow incoming', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "incoming";
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeTruthy();
	}));

	it('should only allow outgoing', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "outgoing";
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeFalsy();
	}));

	it('should not allow any', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "banana";
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeFalsy();
	}));


    describe('search exchange logs', function() {
        it('resetSearch should broadcast resetExchangeLogSearch event', inject(function($rootScope) {
            var broadcastSpy = spyOn($rootScope, '$broadcast');

            scope.resetSearch();

            expect(broadcastSpy).toHaveBeenCalledWith('resetExchangeLogSearch');
        }));

        it('searchExchange should reset newExchangeLogCount', inject(function($rootScope, Alarm) {
            scope.newExchangeLogCount = 5;
            scope.searchExchange();
            expect(scope.newExchangeLogCount).toEqual(0);
        }));

        it('searchExchange should get exchange logs from the server', inject(function($rootScope, $q, Exchange, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchExchange").andReturn(deferred.promise);
            var exchangeLog = new Exchange();
            exchangeLog.id = "ABCD-123";
            var items = [exchangeLog];
            var results = new SearchResultListPage(items, 1, 10);
            deferred.resolve(results);

            scope.searchExchange();
            expect(scope.exchangeLogsSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.exchangeLogsSearchResults.items[0]).toEqual(exchangeLog);
            expect(scope.exchangeLogsSearchResults.loading).toBeFalsy();
            expect(scope.exchangeLogsSearchResults.errorMessage).toEqual('');
        }));


        it('searchExchange should handle search error', inject(function($rootScope, $q, searchService, locale) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchExchange").andReturn(deferred.promise);
            var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();


            scope.searchExchange();
            expect(scope.exchangeLogsSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.exchangeLogsSearchResults.items.length).toEqual(0);
            expect(scope.exchangeLogsSearchResults.loading).toBeFalsy();
            expect(scope.exchangeLogsSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, Alarm, searchService) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchExchange").andReturn(deferred.promise);
            var setPageSpy = spyOn(searchService, "setPage");
            deferred.reject();


            var page = 4;
            scope.gotoPage(page);
            expect(scope.exchangeLogsSearchResults.loading).toBeTruthy();
            scope.$digest();

            expect(setPageSpy).toHaveBeenCalledWith(page);
            expect(searchSpy).toHaveBeenCalled();
        }));
    });

    it('selecteding export in edit selection dropdown should export as csv', inject(function(Exchange) {
        var exportSpy = spyOn(scope, "exportLogsAsCSVFile").andCallFake(function(onlySelectedItems){
            expect(onlySelectedItems).toEqual(true);
        });

        scope.selectedItems = [new Exchange()];
        var selection = {code:'EXPORT'};
        scope.editSelectionCallback(selection);

        expect(exportSpy).toHaveBeenCalled();
    }));


    it('exportLogsAsCSVFile should call service for exporting to csv file', inject(function(Exchange, csvService) {
        //Create fake result
        var exchange = new Exchange();
        scope.exchangeLogsSearchResults.items.push(exchange);

        var csvSpy = spyOn(csvService, "downloadCSVFile").andCallFake(function(data, header, filename){
            expect(filename).toEqual('exchangeLogs.csv');
            expect(data.length).toEqual(1);
            expect(header.length).toBeGreaterThan(1, "Should be at least 1 column");
            expect(header.length).toEqual(data[0].length, "Header and data should have equal number of columns");
        });

        scope.exportLogsAsCSVFile(false);

        expect(csvSpy).toHaveBeenCalled();
    }));

    it('showMessageDetails should go to details page', inject(function(Exchange, $location) {
        var locationChangeSpy = spyOn($location, "path");

        var exchangeLog = new Exchange();
        exchangeLog.logData = {
            guid : 'abc'
        };

        //POLL
        exchangeLog.logData.type = 'POLL';
        scope.showMessageDetails(exchangeLog);
        expect(locationChangeSpy).toHaveBeenCalledWith('/polling/logs/' +exchangeLog.logData.guid);
        expect(locationChangeSpy.callCount).toEqual(1);

        //MOVEMENT
        exchangeLog.logData.type = 'MOVEMENT';
        scope.showMessageDetails(exchangeLog);
        expect(locationChangeSpy).toHaveBeenCalledWith('/movement/' +exchangeLog.logData.guid);
        expect(locationChangeSpy.callCount).toEqual(2);

        //ALARM
        exchangeLog.logData.type = 'ALARM';
        scope.showMessageDetails(exchangeLog);
        expect(locationChangeSpy).toHaveBeenCalledWith('/alarms/holdingtable/' +exchangeLog.logData.guid);
        expect(locationChangeSpy.callCount).toEqual(3);

        //SOMETHING ELSE - location should not change
        exchangeLog.logData.type = 'OTHER';
        scope.showMessageDetails(exchangeLog);
        expect(locationChangeSpy.callCount).toEqual(3);
    }));


    it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
        var alertSpy = spyOn(alertService, "hideMessage");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
    }));


    it('resendQueuedItemInGroup should send queue message with one item ', inject(function($rootScope) {
        var sendQueuedMessagesSpy = spyOn(scope, "sendQueuedMessages").andCallFake(function(ids){
            expect(ids.length).toEqual(1);
        });

        //Resend one item
        scope.resendQueuedItemInGroup('testId');
        expect(sendQueuedMessagesSpy).toHaveBeenCalled();
    }));

    it('resendAllQueueItemsInGroup should send queue message with all items in the group ', inject(function($rootScope, ExchangeSendingQueue) {
        //Create a mock group
        var group = new ExchangeSendingQueue();
        group.recipient ="Test country";
        var a = {messageId:'a'};
        var b = {messageId:'b'};
        var c = {messageId:'c'};
        group.sendingLogList = [a, b, c];
        var sendQueuedMessagesSpy = spyOn(scope, "sendQueuedMessages").andCallFake(function(ids){
            expect(ids.length).toEqual(3);
        });

        //Resend one group
        scope.resendAllQueueItemsInGroup(group.sendingLogList);
        expect(sendQueuedMessagesSpy).toHaveBeenCalled();
    }));

    it('resendAllQueued should send queue message with all items in all groups ', inject(function($rootScope, ExchangeSendingQueue) {
        //Create mock data
        var group1 = new ExchangeSendingQueue();
        group1.recipient ="Test country";
        var a = {messageId:'a'};
        var b = {messageId:'b'};
        var c = {messageId:'c'};
        group1.pluginList.sendingLogList = [a, b, c];

        var group2 = new ExchangeSendingQueue();
        group2.recipient ="Another country";
        var d = {messageId:'d'};
        var e = {messageId:'e'};
        group2.pluginList.sendingLogList = [d, e];

        scope.sendingQueue.items = [group1, group2];

        var sendQueuedMessagesSpy = spyOn(scope, "sendQueuedMessages").andCallFake(function(ids){
            expect(ids.length).toEqual(5);
        });

        //Resend all items
        scope.resendAllQueued();
        expect(sendQueuedMessagesSpy).toHaveBeenCalled();
    }));
});