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
describe('FishingOperation', function() {
  var data;
  beforeEach(module('unionvmsWeb'));

  function getFishingOperationData(){
    return {
          "summary":{
            "occurence":"2016-02-11T12:31:41",
            "vessel_activity":"FSH - Fishing",
            "no_operations":134,
            "fishery_type":"Demersal",
            "targetted_species":[
                "HADDOCK",
                "GADUS",
                "BEAGLE"
            ],
            "fishing_time":{
                "duration":"10d 11h 20m"
            }
          },
          "port":{
            "name":"Kurogsap",
            "geometry":"POINT(62.19434 -83.68266)"
          },
          "reportDoc":{
            "type":"DECLARATION",
            "dateAccepted":"2016-02-21T16:00:09",
            "id":"7a6d3f45-4597-59b0-9279-4f6fcfba5085",
            "refId":"5df53b09-ffd5-510f-9bed-82cf37c887f5",
            "creationDate":"2016-12-19T17:58:58",
            "purposeCode":1,
            "purpose":"Cides su uf utzabi idawa uvodeogi cu kur selgeud bu liwomuto law."
          },
          "sint7":46322660,
          "sint94e":2488574,
          "fishingData":[
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
                  "catchType":"DISCARDED",
                  "units":276,
                  "weightMeans":"STEREOSCOPIC"
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
            },
            {
                "locations":[
                  {
                      "name":"Mosamiz",
                      "geometry":"POINT(-114.86575 74.45711)"
                  },
                  {
                      "name":"Suwwulpik",
                      "geometry":"POINT(36.51493 26.63894)"
                  }
                ],
                "species":"TUR",
                "speciesName":"CODFISH",
                "details":{
                  "catchType":"UNLOADED",
                  "units":190,
                  "weightMeans":"WEIGHED"
                },
                "gears":[
                  {
                      "type":"GND",
                      "role":"On board",
                      "meshSize":"171mm",
                      "beamLength":"69m",
                      "numBeams":5
                  },
                  {
                      "type":"TBB",
                      "role":"On board",
                      "meshSize":"210mm",
                      "beamLength":"27m",
                      "numBeams":5
                  },
                  {
                      "type":"LHM",
                      "role":"On board",
                      "meshSize":"218mm",
                      "beamLength":"49m",
                      "numBeams":5
                  }
                ],
                "lsc":{
                  "type":"LOADED",
                  "unit":1096,
                  "weight":1945,
                  "weight_mean":"ONBOARD"
                },
                "bms":{
                  "type":"UNLOADED",
                  "unit":325,
                  "weight":263,
                  "weight_mean":"WEIGHED"
                },
                "dis":{
                  "type":"DISCARDED",
                  "unit":114,
                  "weight":19,
                  "weight_mean":"WEIGHED"
                },
                "dim":{
                  "type":"LOADED",
                  "unit":554,
                  "weight":1518,
                  "weight_mean":"ONBOARD"
                }
            },
            {
                "locations":[
                  {
                      "name":"Cucudan",
                      "geometry":"POINT(133.69307 -44.15714)"
                  },
                  {
                      "name":"Hurfogow",
                      "geometry":"POINT(-121.79077 36.88248)"
                  },
                  {
                      "name":"Rimelak",
                      "geometry":"POINT(3.30934 -86.8452)"
                  }
                ],
                "species":"LEM",
                "speciesName":"BEAGLE",
                "details":{
                  "catchType":"ONBOARD",
                  "units":407,
                  "weightMeans":"SAMPLING"
                },
                "gears":[
                  {
                      "type":"GTR",
                      "role":"Deployed",
                      "meshSize":"217mm",
                      "beamLength":"6m",
                      "numBeams":5
                  }
                ],
                "lsc":{
                  "type":"DISCARDED",
                  "unit":694,
                  "weight":1461,
                  "weight_mean":"ESTIMATED"
                },
                "bms":{
                  "type":"DISCARDED",
                  "unit":1139,
                  "weight":1151,
                  "weight_mean":"SAMPLING"
                },
                "dis":{
                  "type":"ONBOARD",
                  "unit":1818,
                  "weight":519,
                  "weight_mean":"STEREOSCOPIC"
                },
                "dim":{
                  "type":"ONBOARD",
                  "unit":1397,
                  "weight":233,
                  "weight_mean":"ESTIMATED"
                }
            }
          ],
          "gears":[
            {
                "type":"SSC",
                "role":"Deployed",
                "meshSize":"146mm",
                "beamLength":"91m",
                "numBeams":1
            },
            {
                "type":"GND",
                "role":"On board",
                "meshSize":"246mm",
                "beamLength":"34m",
                "numBeams":1
            },
            {
                "type":"LHM",
                "role":"Deployed",
                "meshSize":"109mm",
                "beamLength":"40m",
                "numBeams":1
            },
            {
                "type":"GTR",
                "role":"Deployed",
                "meshSize":"226mm",
                "beamLength":"91m",
                "numBeams":3
            }
          ]
      };
  }

  function getTransformedSummary() {
    return {
      title: ": ",
      subTitle: "",
      items: {
        fishery_type: "Demersal",
        no_operations: 134,
        occurence: "2016-02-11T12:31:41",
        targetted_species: [
            "HADDOCK",
            "GADUS",
            "BEAGLE"
        ],
        vessel_activity: "FSH - Fishing"
      },
      subItems: {
        duration: "10d 11h 20m"
      }
    };
  }

  it('should instantiate a new empty fishing operation object', inject(function(FishingOperation){
      var fishOp = new FishingOperation();
      
      expect(fishOp).toEqual(jasmine.any(Object));
      expect(fishOp.operationType).not.toBeDefined();
      expect(fishOp.summary).toEqual(jasmine.any(Object));
      expect(fishOp.port).toEqual(jasmine.any(Object));
      expect(fishOp.gears).toEqual([]);
      expect(fishOp.reportDoc).toEqual(jasmine.any(Object));
      expect(fishOp.fishingData).toEqual([]);
  }));

  it('should properly build a fishing operation from json data', inject(function(FishingOperation) {
      data = getFishingOperationData();

      var fishOp = new FishingOperation();
      fishOp.fromJson(data);
      expect(fishOp.summary).toEqual(getTransformedSummary());
      expect(fishOp.port).toEqual(data.port);
      expect(fishOp.reportDoc).toEqual(data.reportDoc);
      
      expect(fishOp.gears.length).toEqual(4);
      expect(fishOp.fishingData.length).toBe(3);
  }));

});
