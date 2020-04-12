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
describe('HoldingtableCtrl', function() {

    var scope, createController, longpollingSpy;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller, longPolling) {
        scope = $rootScope.$new();

        longpollingSpy = spyOn(longPolling, 'poll');

        createController = function(){
            return $controller('HoldingtableCtrl', {$scope: scope});
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

        expect(longpollingSpy).toHaveBeenCalledWith("/rules/activity/alarm", jasmine.any(Function));
    }));

    describe('search alarms', function() {
        it('resetSearch should broadcast resetAlarmSearch event', inject(function($rootScope, longPolling, $q) {
            var broadcastSpy = spyOn($rootScope, '$broadcast');
            var controller = createController();

            scope.resetSearch();

            expect(broadcastSpy).toHaveBeenCalledWith('resetAlarmSearch');
        }));

        it('searchAlarms should reset newAlarmsCount', inject(function($rootScope, Alarm) {
            var controller = createController();
            scope.newAlarmsCount = 5;
            scope.searchAlarms();
            expect(scope.newAlarmsCount).toEqual(0);
        }));

        it('searchAlarms should get alarms from the server', inject(function($rootScope, $q, Alarm, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchAlarms").andReturn(deferred.promise);
            var alarm = new Alarm();
            alarm.guid = "ABCD-123";
            var items = [alarm];
            var results = new SearchResultListPage(items, 1, 10);
            deferred.resolve(results);

            var controller = createController();

            scope.searchAlarms();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(alarm);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('searchAlarms should handle search error', inject(function($rootScope, $q, Alarm, searchService, locale, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchAlarms").andReturn(deferred.promise);
            var searchSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            scope.searchAlarms();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, Alarm, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchAlarms").andReturn(deferred.promise);
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


    it('getRuleNamesTooltip should return tooltip text for rule names', inject(function($rootScope, Alarm) {
        var controller = createController();

        //Create an alarm
        var alarm = new Alarm();
        alarm.alarmItems.push({guid:"A1", ruleName: "First rule"});
        expect(scope.getRuleNamesTooltip(alarm)).toEqual('First rule');

        //Multiple rules, then it should be a comma separated string
        alarm.alarmItems.push({guid:"A2", ruleName: "Second rule"});
        expect(scope.getRuleNamesTooltip(alarm)).toEqual('First rule, Second rule');
    }));


    it('resolveItem should open modal for resolving alarm', inject(function($rootScope, Alarm, AlarmReportModal) {
        var modalSpy = spyOn(AlarmReportModal, "show").andReturn();
        var controller = createController();

        //Create an alarm
        var alarm = new Alarm();
        scope.resolveItem(alarm);
        expect(modalSpy).toHaveBeenCalled();
    }));


    it('viewItemDetails should open modal for viewing closed alarm', inject(function($rootScope, Alarm, AlarmReportModal) {
        var modalSpy = spyOn(AlarmReportModal, "show").andReturn();
        var controller = createController();

        //Create an alarm
        var alarm = new Alarm();
        scope.resolveItem(alarm);
        expect(modalSpy).toHaveBeenCalled();
    }));

    it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
        var controller = createController();
        var alertSpy = spyOn(alertService, "hideMessage");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
    }));
});