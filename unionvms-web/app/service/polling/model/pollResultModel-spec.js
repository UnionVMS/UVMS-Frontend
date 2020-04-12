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
describe('PollResult', function() {

  beforeEach(module('unionvmsWeb'));

    var dto =  {
        "unsentPoll":false,
        "sentPolls":["c1b44664-7e13-4b01-8f0c-e96fd0ca9a34"],
        "unsentPolls":[]
    };

    it('fromDTO should prase the DTO correct', inject(function(PollResult) {
        var pollResult = PollResult.fromDTO(dto);
        expect(pollResult.success).toBeTruthy();
        expect(pollResult.sentPollGuids.length).toEqual(1);
        expect(pollResult.unsentPollsGuids.length).toEqual(0);
    }));

});