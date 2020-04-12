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
describe('pollingLogsCtrl', function(Poll) {

    beforeEach(module('unionvmsWeb'));

    var scope, createController, longpollingSpy;

    beforeEach(inject(function($rootScope, $controller, longPolling, configurationService) {
        scope = $rootScope.$new();
        longpollingSpy = spyOn(longPolling, 'poll');
        spyOn(configurationService, 'getValue').andReturn([]);
        createController = function(stateparams){
            if(angular.isUndefined(stateparams)){
                stateparams = {};
            }
            return $controller('pollingLogsCtrl', {$scope: scope, $stateParams:stateparams});
        }
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should start longPolling on init ', inject(function($rootScope) {
        var controller = createController();
        expect(longpollingSpy).toHaveBeenCalledWith("/exchange/activity/poll", jasmine.any(Function));
    }));

    it('should search for program polls on init', inject(function($q, searchService) {
        var deferred = $q.defer();
        var searchSpy = spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var controller = createController();

        expect(searchSpy).toHaveBeenCalled();
    }));

    describe('search polling logs', function() {

        it('search should reset newPollingLogCount', inject(function($rootScope) {
            var controller = createController();
            scope.newPollingLogCount = 5;
            scope.searchPolls();
            expect(scope.newPollingLogCount).toEqual(0);
        }));

        it('should get polling logs from the server', inject(function($q, PollingLog, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchPolls").andReturn(deferred.promise);
            var pollingLog = new PollingLog();
            pollingLog.id = "ABCD-123";
            var results = new SearchResultListPage([pollingLog], 1, 1);
            deferred.resolve(results);

            var controller = createController();

            //Search is done on init
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(pollingLog);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('should handle error when trying to get program polls from server', inject(function($q, searchService, locale) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchPolls").andReturn(deferred.promise);
            var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            //Search is done on init
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

    });

    it('should get poll by id on init if state param id is available', inject(function(Poll, $q, searchService) {
        var deferred = $q.defer();
        var searchSpy = spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var addIdAsSerchCriteriaSpy = spyOn(searchService, 'addSearchCriteria');

        var controller = createController({id:'TEST'});
        scope.$digest();

        //Active tab should be POLLING_LOGS_BY_ID
        expect(scope.activeTab).toEqual("POLLING_LOGS_BY_ID");

        //scope.showPollByID should be true
        expect(scope.showPollByID).toBeTruthy();

        //search criteria POLL_ID should have been added
        expect(addIdAsSerchCriteriaSpy).toHaveBeenCalledWith('POLL_ID', 'TEST');

        expect(searchSpy).toHaveBeenCalled();
    }));

    it('should get poll by id on init if state param id is available should handle error', inject(function($q, searchService, locale) {
        var deferred = $q.defer();
        deferred.reject();
        var searchSpy = spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");

        var controller = createController({id:'TEST'});
        scope.$digest();

        expect(scope.currentSearchResults.items.length).toEqual(0);
        expect(scope.currentSearchResults.loading).toBeFalsy();
        expect(scope.currentSearchResults.errorMessage).not.toEqual('')
    }));

    it('should remove FROM_DATE and TO_DATE when TIME_SPAN changes to something other than CUSTOM', inject(function($q, searchService) {
        var deferred = $q.defer();
        spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to something other than CUSTOM should remove FROM_DATE and TO_DATE from advancedSearchObject
        scope.advancedSearchObject.TIME_SPAN = 'UPDATED_VALUE';
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeFalsy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeFalsy()
    }));

    it('should not remove FROM_DATE and TO_DATE when TIME_SPAN changes to CUSTOM', inject(function($q, searchService) {
        var deferred = $q.defer();
        spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to CUSTOM, should keep FROM_DATE and TO_DATE
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_CUSTOM;
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeTruthy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeTruthy()
    }));

    it('should change TIME_SPAN to CUSTOM when FROM_DATE or TO_DATE changes', inject(function($q, searchService) {
        var deferred = $q.defer();
        spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change FROM_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.FROM_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TO_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.TO_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);
    }));

    it('showComment should open modal with poll comment', inject(function($q, searchService, PollingLog, Poll, infoModal) {
        //Create mock poll
        var pollingLog = new PollingLog();
        var poll = new Poll;
        poll.comment ="Test comment";
        pollingLog.poll = poll;

        var deferred = $q.defer();
        spyOn(searchService, "searchPolls").andReturn(deferred.promise);
        var modalSpy = spyOn(infoModal, 'open').andCallFake(function(options){
            expect(options.textLabel).toEqual(poll.comment);
            expect(options.titleLabel).toBeDefined();
        });
        var controller = createController();

        scope.showComment(pollingLog);
        scope.$digest();

        expect(modalSpy).toHaveBeenCalled();
    }));

    it('exportLogsAsCSVFile should call service for exporting to csv file', inject(function(PollingLog, Poll, csvService) {
        var controller = createController();

        //Create fake result
        var pollingLog = new PollingLog();
        var poll = new Poll;
        pollingLog.poll = poll;
        scope.currentSearchResults.items.push(pollingLog);

        var csvSpy = spyOn(csvService, "downloadCSVFile").andCallFake(function(data, header, filename){
            expect(filename).toEqual('pollingLogs.csv');
            expect(data.length).toEqual(1);
            expect(header.length).toBeGreaterThan(1, "Should be at least 1 column");
            expect(header.length).toEqual(data[0].length, "Header and data should have equal number of columns");
        });

        scope.exportLogsAsCSVFile(false);

        expect(csvSpy).toHaveBeenCalled();
    }));

});