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
        "events": [
          {
            "eventCode": "CREATE",
            "serialNumber": "1",
            "attributes": [
              {
                "type": "ANSWER_BACK",
                "value": "4"
              },
              {
                "type": "SERIAL_NUMBER",
                "value": "1"
              },
              {
                "type": "SATELLITE_NUMBER",
                "value": "3"
              },
              {
                "type": "ANTENNA",
                "value": "2"
              },
              {
                "type": "TRANSCEIVER_TYPE",
                "value": "5"
              },
              {
                "type": "MULTIPLE_OCEAN",
                "value": "581"
              },
              {
                "type": "SOFTWARE_VERSION",
                "value": "6"
              }
            ],
            "changeDate": "2016-11-18T14:57:30.705Z",
            "comments": "Automatic create comment"
          }
        ],
        "comChannels": [
          {
            "channel": [
              {
                "eventCode": "CREATE",
                "changeDate": "2016-11-18T14:57:30.707Z",
                "name": "VMS",
                "attributes": [
                  {
                    "type": "FREQUENCY_GRACE_PERIOD",
                    "value": "0"
                  },
                  {
                    "type": "MEMBER_NUMBER",
                    "value": "12"
                  },
                  {
                    "type": "FREQUENCY_EXPECTED",
                    "value": "0"
                  },
                  {
                    "type": "FREQUENCY_IN_PORT",
                    "value": "0"
                  },
                  {
                    "type": "LES_DESCRIPTION",
                    "value": "twostage"
                  },
                  {
                    "type": "DNID",
                    "value": "55"
                  }
                ]
              }
            ]
          },
          {
            "channel": [
              {
                "eventCode": "CREATE",
                "changeDate": "2016-11-21T08:24:38.125Z",
                "name": "HAV",
                "attributes": [
                  {
                    "type": "FREQUENCY_GRACE_PERIOD",
                    "value": "0"
                  },
                  {
                    "type": "MEMBER_NUMBER",
                    "value": "2"
                  },
                  {
                    "type": "FREQUENCY_EXPECTED",
                    "value": "0"
                  },
                  {
                    "type": "FREQUENCY_IN_PORT",
                    "value": "0"
                  },
                  {
                    "type": "LES_DESCRIPTION",
                    "value": "twostage"
                  },
                  {
                    "type": "DNID",
                    "value": "1"
                  }
                ]
              }
            ]
          }
        ]
    };

    it('fromJson should build a correct object', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);

        expect(history.events[0].eventCode).toEqual(responseData.events[0].eventCode);
        expect(history.events[0].serialNumber).toEqual(responseData.events[0].serialNumber);
        expect(history.events[0].changeDate).toEqual(responseData.events[0].changeDate);

        expect(history.channels[0].events[0].name).toEqual(responseData.comChannels[0].channel[0].name);
        expect(history.channels[0].events[0].eventCode).toEqual(responseData.comChannels[0].channel[0].eventCode);
        expect(history.channels[0].events[0].changeDate).toEqual(responseData.comChannels[0].channel[0].changeDate);

        expect(history.channels[1].events[0].name).toEqual(responseData.comChannels[1].channel[0].name);
        expect(history.channels[1].events[0].eventCode).toEqual(responseData.comChannels[1].channel[0].eventCode);
        expect(history.channels[1].events[0].changeDate).toEqual(responseData.comChannels[1].channel[0].changeDate);
    }));
});
