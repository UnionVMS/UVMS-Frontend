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
  
  function getFishingOperationData(){
      return {
          "activityDetails": {
              "occurence": "2017-01-21T04:16:08",
              "reason": "Fishing",
              "fisheryType": "Demersal",
              "targetedSpecies": [
                  "CODFISH",
                  "BEAGLE",
                  "GADUS",
                  "SEAFOOD"
              ]},
          "ports": {
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
          "reportDetails": {
              "type": "NOTIFICATION",
              "dateAccepted": "2016-08-25T10:29:58",
              "id": "d1a71a7c-9b86-592b-bdc6-6f9b2958ac78",
              "refId": "38322286-c95b-57db-b35e-88702dadfc7e",
              "creationDate": "2017-02-08T11:15:47",
              "purposeCode": 3,
              "purpose": "Nizcu sev fabu nathe gani bucava sa vagowwi buzi ekje zobhe ke gesepomi bueb ced."},
          "catches": [{
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
  
  it('should instantiate a new empty departure object', inject(function(FishingActivity){
      var fa = new FishingActivity('fishing_operation');
      
      expect(fa).toEqual(jasmine.any(Object));
      expect(fa.faType).toEqual('fa_type_fishing_operation');
      expect(fa.operationType).not.toBeDefined();


      expect(fa.activityDetails).not.toBeDefined();
      expect(fa.ports).not.toBeDefined();
      expect(fa.gears).not.toBeDefined();
      expect(fa.reportDetails).not.toBeDefined();
      expect(fa.catches).not.toBeDefined();
  }));

  it('should properly build a fishing operation from json data', inject(function(FishingActivity) {
      data = getFishingOperationData();

      var fa = new FishingActivity('fishing_operation');
      fa.fromJson(data);
      
      expect(fa.activityDetails).toBeDefined();
      expect(fa.activityDetails.items).toBeDefined();
      expect(fa.activityDetails.subItems).toBeDefined();
      expect(fa.activityDetails.title).toBeDefined();
      expect(fa.activityDetails.subTitle).toBeDefined();

      expect(fa.ports).toEqual(data.ports);

      expect(fa.reportDetails).toBeDefined();
      expect(fa.reportDetails.items).toBeDefined();
      expect(fa.reportDetails.subItems).toBeDefined();
      expect(fa.reportDetails.title).toBeDefined();
      expect(fa.reportDetails.subTitle).toBeDefined();
      
      expect(fa.gears.length).toEqual(2);
      expect(fa.catches.length).toBe(1);
  }));

});
