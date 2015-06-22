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