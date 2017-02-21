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
describe('ArrivalNotification', function () {
  var data;
  beforeEach(module('unionvmsWeb'));

  beforeEach(function () {
    data = getNotificationArrivalData();
  });
  function getNotificationArrivalData() {
    return {
      "arrival": {
        "estimatedArrival": "2017-05-03T17:40:24",
        "reason": "LAND"
      },
      "port": {
        "name": "Hicupzo",
        "geometry": "POINT(-38.66035 63.28522)"
      },
      "reportDoc": {
        "type": "DECLARATION",
        "dateAccepted": "2017-05-29T12:10:49",
        "id": "a5e65678-8792-5d3e-9fa3-6563a7e1158d",
        "refId": "d6d4903a-0196-5b55-b338-ebf1bbcff214",
        "creationDate": "2017-05-26T16:15:29",
        "purposeCode": 1,
        "purpose": "Hodowrud egiuweno itaako wa jaugedu paboh ma fur kul mad nocelko hiboffo dafugik vujacag."
      },
      "arrivalCatchData": [{
        "lsc": 1426,
        "bms": 367,
        "locations": [{
          "name": "Beplanid",
          "geometry": "POINT(-137.64668 -69.1734)"
        }, {
          "name": "Agnape",
          "geometry": "POINT(-153.82748 70.0597)"
        }],
        "details": {
          "catchType": "KEPT_IN_NET",
          "unit": "kg",
          "weightMeans": "ONBOARD"
        },
        "species": "SOL",
        "speciesName": "SEAFOOD"
      }]
    }

  }

  it('should instantiate a new empty arrival Notification object', inject(function (ArrivalNotification) {
    var arrNoti = new ArrivalNotification();
    expect(arrNoti).toEqual(jasmine.any(Object));
    expect(arrNoti.arrival).toEqual(jasmine.any(Object));
    expect(arrNoti.port).toEqual(jasmine.any(Object));
    expect(arrNoti.reportDoc).toEqual(jasmine.any(Object));
    expect(arrNoti.fishingData).toEqual([]);
  }));

  it('should properly build a arrival Notification from json data', inject(function (ArrivalNotification) {
    var arrNoti = new ArrivalNotification();
    arrNoti.fromJson(data)
    expect(arrNoti.arrival).toEqual(data.arrival);
    expect(arrNoti.port).toEqual(data.port);
    expect(arrNoti.reportDoc).toEqual(data.reportDoc);
    expect(arrNoti.fishingData.length).toBe(1);

  }));

});

