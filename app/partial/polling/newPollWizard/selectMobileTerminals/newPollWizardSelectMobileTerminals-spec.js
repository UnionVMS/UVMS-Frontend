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
describe('NewpollwizardselectmobileterminalsCtrl', function() {

    var scope,createController;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            return $controller('NewpollwizardselectmobileterminalsCtrl', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should get pollable channels on init', inject(function($rootScope, $q, searchService) {
        var deferred = $q.defer();
        var searchSpy = spyOn(searchService, "searchForPollableTerminals").andReturn(deferred.promise);

        var controller = createController();
        expect(searchSpy).toHaveBeenCalled();
    }));

    describe('search pollable channels', function() {

        it('getPollableChannels should get pollable channels from the server', inject(function($rootScope, $q, PollChannel, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchForPollableTerminals").andReturn(deferred.promise);
            var pollChannel = new PollChannel();
            pollChannel.connectId = "ABCD-123";
            var items = [pollChannel];
            var results = new SearchResultListPage(items, 1, 10);
            deferred.resolve(results);

            var controller = createController();

            scope.getPollableChannels();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(pollChannel);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('getPollableChannels should handle search error', inject(function($rootScope, $q, searchService, locale) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchForPollableTerminals").andReturn(deferred.promise);
            var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            scope.getPollableChannels();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, searchService) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchForPollableTerminals").andReturn(deferred.promise);
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

        it('selectChannel should add selectedChannel using the pollingService', inject(function($rootScope, pollingService, PollChannel) {

            var addChannelSpy = spyOn(pollingService, "addMobileTerminalToSelection");
            var controller = createController();

            var pollChannel = new PollChannel();
            pollChannel.connectId = "ABCD-123";

            scope.selectChannel(pollChannel);

            expect(addChannelSpy).toHaveBeenCalledWith(pollChannel);
        }));


        it('unselectChannel should remove selectedChannel using the pollingService', inject(function($rootScope, pollingService, PollChannel) {

            var addChannelSpy = spyOn(pollingService, "removeMobileTerminalFromSelection");
            var controller = createController();

            var pollChannel = new PollChannel();
            pollChannel.connectId = "ABCD-123";

            scope.unselectChannel(pollChannel);

            expect(addChannelSpy).toHaveBeenCalledWith(undefined, pollChannel);
        }));

        it('selectAllVessels should add terminals as a group when selectedGroup is set', inject(function($rootScope, pollingService, PollChannel, SavedSearchGroup) {
            //Creat saved search group mock
            var group = new SavedSearchGroup();
            group.name="Test group";

            var addGroupSpy = spyOn(pollingService, "addMobileTerminalGroupToSelection").andCallFake(function(mobileTerminalGroup){
                expect(mobileTerminalGroup.name).toEqual(group.name);
                expect(mobileTerminalGroup.mobileTerminals.length).toEqual(2);
            });
            var controller = createController();

            //Select a group
            scope.selectedGroup.savedSearchGroup = group;

            //Mock search result
            var pollChannel1 = new PollChannel();
            pollChannel1.comChannelId = "ABCD-123";
            var pollChannel2 = new PollChannel();
            pollChannel2.comChannelId = "ABCD-123";
            scope.currentSearchResults.items = [pollChannel1, pollChannel2];

            //Select all vessels in search result
            scope.selectAllVessels();

            expect(addGroupSpy).toHaveBeenCalled();
        }));

        it('selectAllVessels should add terminals as single terminal when selectedGroup is not set', inject(function($rootScope, pollingService, PollChannel) {
            var addTerminalToSelectionSpy = spyOn(pollingService, "addMobileTerminalToSelection");
            var controller = createController();

            //Mock search result
            var pollChannel1 = new PollChannel();
            pollChannel1.comChannelId = "ABCD-123";
            var pollChannel2 = new PollChannel();
            pollChannel2.comChannelId = "ABCD-123";
            scope.currentSearchResults.items = [pollChannel1, pollChannel2];

            //Select all vessels in search result
            scope.selectAllVessels();

            expect(addTerminalToSelectionSpy).toHaveBeenCalled();
            expect(addTerminalToSelectionSpy.callCount).toEqual(2);
        }));
    });

});