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
describe('ExchangePoll', function() {

  beforeEach(module('unionvmsWeb'));

    var exchangePollDTO = {
        "guid": "0352a8cc-49e5-4aed-85b0-d8ab8e341d48",
        "typeRef": {
            "refGuid": "ec3651b3-3fb6-4d71-9ca5-4e2bb5206eb3",
            "type": "POLL"
        },
        "history": [
            {
                "timestamp": 1446715153522,
                "status": "ISSUED"
            },
            {
                "timestamp": 1446715152522,
                "status": "SENT"
            }
        ]
    };


    it("should parse DTO correctly", inject(function(ExchangePoll) {
        var exchangePoll = ExchangePoll.fromDTO(exchangePollDTO);

        expect(exchangePoll.guid).toEqual(exchangePollDTO.guid);
        expect(exchangePoll.pollGuid).toEqual(exchangePollDTO.typeRef.refGuid);
        expect(exchangePoll.history.length).toEqual(2);
        expect(exchangePoll.history[0].status).toEqual("ISSUED");
        expect(exchangePoll.history[0].time).toEqual(1446715153522);
        expect(exchangePoll.history[1].status).toEqual("SENT");
        expect(exchangePoll.history[1].time).toEqual(1446715152522);
    }));


});