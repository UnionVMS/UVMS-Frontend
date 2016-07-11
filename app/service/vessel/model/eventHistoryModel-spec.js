/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('EventHistoryModel', function() {

  beforeEach(module('unionvmsWeb'));

    var historyData = {
        "eventId": "50c884e8-f03d-4222-841b-6ad1f2263694",
        "eventCode": "MOD",
        "eventDate": 1434924000000
    };

    it('create new should set correct values', inject(function(EventHistory) {
        var eventHistory = new EventHistory();

        expect(eventHistory.eventId).toBeUndefined();
        expect(eventHistory.eventCode).toBeUndefined();
        expect(eventHistory.eventDate).toBeUndefined();
    }));

    it("fromDTO should create correct object", inject(function(EventHistory) {
        var eventHistory = EventHistory.fromDTO(historyData);
        expect(eventHistory.eventId).toEqual(historyData.eventId);
        expect(eventHistory.eventCode).toEqual(historyData.eventCode);
        expect(eventHistory.eventDate).toEqual(historyData.eventDate);
    }));

    it("copy should create an identical object", inject(function(EventHistory) {
        var origEventHistory = EventHistory.fromDTO(historyData);
        var historyCopy = origEventHistory.copy();

        expect(historyCopy.eventId).toEqual(origEventHistory.eventId);
        expect(historyCopy.eventCode).toEqual(origEventHistory.eventCode);
        expect(historyCopy.eventDate).toEqual(origEventHistory.eventDate);

    }));
      
});