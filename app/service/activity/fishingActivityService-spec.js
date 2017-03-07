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
describe('fishingActivityService', function() {
  var mockMdrServ,faObj;
  beforeEach(module('unionvmsWeb'));

  beforeEach(function(){
      mockMdrServ = jasmine.createSpyObj('mdrCacheService', ['getCodeList']);
      
      module(function($provide){
          $provide.value('mdrCacheService', mockMdrServ);
      });
      builMocks();
      faObj = {
        fishingData: getFishingData(),
        gears: getFaGears()
      };
  });

  function getFaGears() {
    return [{
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
    }];
  }

  function getFaGearsResult() {
    return [{
        "type": "LHM - Handlines and pole-lines (mechanized)",
        "role": "On board",
        "meshSize": "231mm",
        "beamLength": "53m",
        "numBeams": 2
    },{
        "type": "SSC - Scottish seines",
        "role": "On board",
        "meshSize": "65mm",
        "beamLength": "39m",
        "numBeams": 4
    }];
  }

  function getFishingData() {
      return [
            {
            "locations":[
              {
                  "name":"Wutizze",
                  "geometry":"POINT(-126.4814 -63.86828)"
              },
              {
                  "name":"Hidosre",
                  "geometry":"POINT(175.03229 19.17956)"
              },
              {
                  "name":"Solcued",
                  "geometry":"POINT(-126.60815 -57.40876)"
              }
            ],
            "species":"SAL",
            "speciesName":"GADUS",
            "details":{
              "catchType":"KEPT_IN_NET",
              "units":276,
              "weightMeans":"ESTIMATED"
            },
            "gears":[
              {
                  "type":"GND",
                  "role":"On board",
                  "meshSize":"61mm",
                  "beamLength":"81m",
                  "numBeams":3
              },
              {
                  "type":"SSC",
                  "role":"On board",
                  "meshSize":"189mm",
                  "beamLength":"35m",
                  "numBeams":3
              },
              {
                  "type":"TBB",
                  "role":"Deployed",
                  "meshSize":"53mm",
                  "beamLength":"1m",
                  "numBeams":1
              },
              {
                  "type":"LHM",
                  "role":"Deployed",
                  "meshSize":"144mm",
                  "beamLength":"58m",
                  "numBeams":2
              }
            ],
            "lsc":{
              "type":"ONBOARD",
              "unit":1200,
              "weight":271,
              "weight_mean":"WEIGHED"
            },
            "bms":{
              "type":"UNLOADED",
              "unit":1517,
              "weight":1800,
              "weight_mean":"ONBOARD"
            },
            "dis":{
              "type":"KEPT_IN_NET",
              "unit":355,
              "weight":1059,
              "weight_mean":"ESTIMATED"
            },
            "dim":{
              "type":"DISCARDED",
              "unit":1270,
              "weight":1625,
              "weight_mean":"SAMPLING"
            }
        }
      ];
  }

  function getFishingDataResult() {
      return [
            {
            "locations":[
              {
                  "name":"Wutizze",
                  "geometry":"POINT(-126.4814 -63.86828)"
              },
              {
                  "name":"Hidosre",
                  "geometry":"POINT(175.03229 19.17956)"
              },
              {
                  "name":"Solcued",
                  "geometry":"POINT(-126.60815 -57.40876)"
              }
            ],
            "species":"SAL",
            "speciesName":"GADUS",
            "details":{
              "catchType":"KEPT_IN_NET",
              "units":276,
              "weightMeans":"ESTIMATED",
              "typeDesc":"Catch kept in the net",
              "weightMeansDesc": "Estimated weight mean"
            },
            "gears":[
              {
                  "type":"GND",
                  "role":"On board",
                  "meshSize":"61mm",
                  "beamLength":"81m",
                  "numBeams":3
              },
              {
                  "type":"SSC",
                  "role":"On board",
                  "meshSize":"189mm",
                  "beamLength":"35m",
                  "numBeams":3
              },
              {
                  "type":"TBB",
                  "role":"Deployed",
                  "meshSize":"53mm",
                  "beamLength":"1m",
                  "numBeams":1
              },
              {
                  "type":"LHM",
                  "role":"Deployed",
                  "meshSize":"144mm",
                  "beamLength":"58m",
                  "numBeams":2
              }
            ],
            "lsc":{
              "type":"ONBOARD",
              "unit":1200,
              "weight":271,
              "weight_mean":"WEIGHED"
            },
            "bms":{
              "type":"UNLOADED",
              "unit":1517,
              "weight":1800,
              "weight_mean":"ONBOARD"
            },
            "dis":{
              "type":"KEPT_IN_NET",
              "unit":355,
              "weight":1059,
              "weight_mean":"ESTIMATED"
            },
            "dim":{
              "type":"DISCARDED",
              "unit":1270,
              "weight":1625,
              "weight_mean":"SAMPLING"
            }
        }
      ];
  }

  function getGears(){
      return [{
          "code": "LHM",
          "description": "Handlines and pole-lines (mechanized)"
      },
      {
          "code": "SSC",
          "description": "Scottish seines"
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

  function builMocks(){
      mockMdrServ.getCodeList.andCallFake(function(param){
          if (param === 'gear_type'){
              return {
                then: function(callback){
                    return callback(getGears());
                }
              };
          } else if (param === 'fa_catch_type'){
              return {
                  then: function(callback){
                      return callback(getCatchType());
                  }
              };
          } else {
              return {
                  then: function(callback){
                      return callback(getWeightMeans());
                  }
              };
          }
      });
  }

  it('should ...', inject(function(fishingActivityService) {
    fishingActivityService.addGearDescription(faObj);
    fishingActivityService.addCatchTypeDescription(faObj);
    fishingActivityService.addWeightMeansDescription(faObj);

    expect(mockMdrServ.getCodeList.callCount).toBe(3);

    expect(faObj.gears).toEqual(getFaGearsResult());
    expect(faObj.fishingData).toEqual(getFishingDataResult());
  }));

});
