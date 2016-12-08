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
describe('mobileTerminalRestService', function() {

    var mobileTerminals;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($httpBackend) {
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    beforeEach(inject(function(MobileTerminal) {
        var mt1 = new MobileTerminal();
        mt1.guid = '9fa46135-1668-4aaf-b9cf-310a2ad810b6';
        mt1.connectId = 'my-connect-id';

        var mt2 = new MobileTerminal();
        mt2.guid = '9fa46135-4aaf-b9cf-1668-310a2ad810b6';
        mt2.connectId = 'my-connect-id';

        var mt3 = new MobileTerminal();
        mt3.guid = '9fa46135-b9cf-1668-4aaf-310a2ad810b6';
        mt3.connectId = 'my-connect-id';

        mobileTerminals = [mt1, mt2, mt3];
    }));

    it('should fetch all mobile terminals, even when they come on multiple pages', inject(function(mobileTerminalRestService, SearchResultListPage, $q, $rootScope) {
        spyOn(mobileTerminalRestService, 'getMobileTerminalList').andCallFake(function(request) {
            // Extract current page.
            var pages = Math.ceil(mobileTerminals.length / 2);
            var items = mobileTerminals.slice((request.page - 1) * 2, request.page * 2);
            return $q.when(new SearchResultListPage(items, request.page, pages));
        });

        var actualTerminals;
        mobileTerminalRestService.getAllMobileTerminalsWithConnectId('my-connect-id').then(function(terminals) {
            actualTerminals = terminals;
        });

        $rootScope.$digest();

        expect(mobileTerminalRestService.getMobileTerminalList.calls.length).toBe(2);
        expect(actualTerminals.length).toBe(3);
        expect(actualTerminals).toEqual(mobileTerminals);
    }));

});