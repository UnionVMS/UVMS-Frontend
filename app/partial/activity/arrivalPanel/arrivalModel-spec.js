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
describe('Arrival', function () {
  var data;
  beforeEach(module('unionvmsWeb'));

  beforeEach(function () {
    data = getArrivalData();
  });


  function getArrivalData() {
    return {
      "arrival": {
        "arrivalTime": "2017-08-17T01:35:38",
        "reason": "LAND",
        "intendedLandingTime": "2016-10-20T09:29:15"
      },
      "port": {
        "name": "Konfevho",
        "geometry": "POINT(-107.60515 -52.50039)"
      },
      "gears": [{
        "type": "GND",
        "role": "Deployed",
        "meshSize": "145mm",
        "beamLength": "80m",
        "numBeams": 2
      }, {
        "type": "SSC",
        "role": "On board",
        "meshSize": "67mm",
        "beamLength": "35m",
        "numBeams": 1
      }, {
        "type": "TBB",
        "role": "Deployed",
        "meshSize": "109mm",
        "beamLength": "61m",
        "numBeams": 5
      }, {
        "type": "GTR",
        "role": "Deployed",
        "meshSize": "87mm",
        "beamLength": "81m",
        "numBeams": 2
      }],
      "reportDoc": {
        "type": "DECLARATION",
        "dateAccepted": "2017-03-22T21:51:56",
        "id": "49bc5f02-3a59-577b-a65b-604e6fa3301e",
        "refId": "98926db3-fa2c-56ec-8c9b-6c28c5e69afe",
        "creationDate": "2015-11-27T21:44:32",
        "purposeCode": 9,
        "purpose": "Liakoesu waku italehwen gatno umtambam zol ge ahe cif zud jubap gatueho soh jitubwav."
      }
    }
  }


  it('should instantiate a new empty arrival object', inject(function (Arrival) {
    var arr = new Arrival();

    expect(arr).toEqual(jasmine.any(Object));
    expect(arr.arrival).toEqual(jasmine.any(Object));
    expect(arr.port).toEqual(jasmine.any(Object));
    expect(arr.gears).toEqual([]);
    expect(arr.reportDoc).toEqual(jasmine.any(Object));

  }));

  it('should properly build a arrival from json data', inject(function (Arrival) {
    var arr = new Arrival();
    arr.fromJson(data)
    expect(arr.arrival).toEqual(data.arrival);
    expect(arr.port).toEqual(data.port);
    expect(arr.reportDoc).toEqual(data.reportDoc);
    var srcData = getArrivalData();
    expect(arr.gears.length).toEqual(4);


  }));

});
