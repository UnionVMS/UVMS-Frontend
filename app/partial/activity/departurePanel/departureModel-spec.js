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
describe('Departure', function() {
  var data;
  beforeEach(module('unionvmsWeb'));
  
  function getGears(){
      return [{
          "code": "SSC",
          "description": "Scottish seines"
      },{
          "code": "LHM",
          "description": "Handlines and pole-lines (mechanized)"
      }];
  }
  
  function getCatchType(){
      return [{
          "code": "KEPT_IN_NET",
          "description": "Catch kept in the net"
      }];
  }
  
  function getWeightMeans(){
      return [{
          "code": "ESTIMATED",
          "description": "Estimated weight mean"
      }];
  }

  function getDepartureData(){
      return {
          "summary": {
              "occurence": "2017-01-21T04:16:08",
              "reason": "Fishing",
              "fisheryType": "Demersal",
              "targetedSpecies": [
                  "CODFISH",
                  "BEAGLE",
                  "GADUS",
                  "SEAFOOD"
              ]},
          "port": {
              "name": "Duivgug",
              "geometry": "POINT(-51.90263 21.4388)"},
          "gears": [{
                  "type": "LHM",
                  "role": "On board",
                  "meshSize": "231mm",
                  "beamLength": "53m",
                  "numBeams": 2
              },{
                  "type": "SSC",
                  "role": "On board",
                  "meshSize": "65mm",
                  "beamLength": "39m",
                  "numBeams": 4
              }],
          "reportDoc": {
              "type": "NOTIFICATION",
              "dateAccepted": "2016-08-25T10:29:58",
              "id": "d1a71a7c-9b86-592b-bdc6-6f9b2958ac78",
              "refId": "38322286-c95b-57db-b35e-88702dadfc7e",
              "creationDate": "2017-02-08T11:15:47",
              "purposeCode": 3,
              "purpose": "Nizcu sev fabu nathe gani bucava sa vagowwi buzi ekje zobhe ke gesepomi bueb ced."},
          "fishingData": [{
                  "lsc": 1816,
                  "bms": 423,
                  "locations": [{
                          "name": "Ugiudtik",
                          "geometry": "POINT(-3.30141 -72.37756)"
                      }],
                  "details": {
                      "catchType": "KEPT_IN_NET",
                      "unit": "kg",
                      "weightMeans": "ESTIMATED"},
                  "species": "COD",
                  "speciesName": "HADDOCK"
              }]
      };
  }
  
  it('should instantiate a new empty departure object', inject(function(Departure){
      var dep = new Departure();
      
      expect(dep).toEqual(jasmine.any(Object));
      expect(dep.faType).toEqual('fa_type_departure');
      expect(dep.operationType).not.toBeDefined();
      expect(dep.summary).toEqual(jasmine.any(Object));
      expect(dep.port).toEqual(jasmine.any(Object));
      expect(dep.gears).toEqual([]);
      expect(dep.reportDoc).toEqual(jasmine.any(Object));
      expect(dep.fishingData).toEqual([]);
  }));

  it('should properly build a departure from json data', inject(function(Departure) {
      var dep = new Departure();
      dep.fromJson(data);
      
      expect(dep.summary).toEqual(data.summary);
      expect(dep.port).toEqual(data.port);
      expect(dep.reportDoc).toEqual(data.reportDoc);
      
      var srcData = getDepartureData();
      var gears = getGears();
      var catchType = getCatchType();
      var weightMeans = getWeightMeans();
      
      expect(dep.gears.length).toEqual(2);
      expect(dep.gears[0].type).toEqual(srcData.gears[0].type + ' - ' + gears[0].description);
      expect(dep.fishingData.length).toBe(1);
      expect(dep.fishingData[0].details.typeDesc).toEqual(catchType[0].description);
      expect(dep.fishingData[0].details.weightMeansDesc).toEqual(weightMeans[0].description);
  }));

});
