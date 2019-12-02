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
describe('pollingService', function() {

    beforeEach(module('unionvmsWeb'));

    it('should add all selected mobile terminals', inject(function(pollingService, MobileTerminalGroup, MobileTerminal) {

        function createSomeTerminals() {
            return ["mt1","mt2","mt3"].map(function() {
                return new MobileTerminal();
            });
        }

        function createSomeTerminalGroups(groups, terminals) {
            return ["mtg1", "mtg2", "mtg3"].map(function() {
                var mtg = new MobileTerminalGroup();
                mtg.mobileTerminals = createSomeTerminals();
                return mtg;
            });
        }

        pollingService.getSelection().selectedMobileTerminals = createSomeTerminals();
        pollingService.getSelection().selectedMobileTerminalGroups = createSomeTerminalGroups();
        var mts = pollingService.getSelectedChannels();
        expect(mts.length).toBe(12);
    }));

});