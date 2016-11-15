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
describe('MobileTerminalHistory', function() {

    beforeEach(module('unionvmsWeb'));

    var responseData  = {
      "eventCode": "MODIFY",
      "connectId": null,
      "sateliteNumber": "3435",
      "comChannelHistory": [
        {
          "comChannelInfo": [
            {
              "name": "VMS",
              "attributes": [
                {
                  "type": "DNID",
                  "value": "10745"
                },
                {
                  "type": "MEMBER_NUMBER",
                  "value": "255"
                }
              ]
            }
          ]
        },
        {
          "comChannelInfo": null
        }
      ],
      "changeDate": "2016-11-14T10:02:22.671Z",
      "comments": "asdf"
    };

    it('fromJson should build a correct object', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);

        expect(history.satelliteNumber).toEqual("3435");
        expect(history.comment).toEqual(responseData.comments);
        expect(history.eventCode).toEqual(responseData.eventCode);
        expect(history.changeDate).toEqual(responseData.changeDate);

        expect(history.comChannelHistory[0].comChannelInfo[0].name).toEqual("VMS");
        expect(history.comChannelHistory[0].comChannelInfo[0].attributes[0].type).toEqual("DNID");
        expect(history.comChannelHistory[0].comChannelInfo[0].attributes[0].value).toEqual("10745");
        expect(history.comChannelHistory[0].comChannelInfo[0].attributes[1].type).toEqual("MEMBER_NUMBER");
        expect(history.comChannelHistory[0].comChannelInfo[0].attributes[1].value).toEqual("255");
    }));
});
