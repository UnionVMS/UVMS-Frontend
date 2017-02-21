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
describe('tableChart', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile;

  beforeEach(inject(function($rootScope,$compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

  it('should compile and switch between table and chart modes', function() {

      scope.fishingData = [
         {
            "locations":[
               {
                  "name":"Hovataupo",
                  "geometry":"POINT(39.35684 -34.35292)"
               },
               {
                  "name":"Zeskiri",
                  "geometry":"POINT(-80.80942 70.59964)"
               },
               {
                  "name":"Deodebo",
                  "geometry":"POINT(-123.39813 52.55888)"
               }
            ],
            "species":"SOL",
            "speciesName":"BEAGLE",
            "gears":[
               {
                  "type":"LHM",
                  "role":"On board",
                  "meshSize":"195mm",
                  "beamLength":"38m",
                  "numBeams":1
               },
               {
                  "type":"TBB",
                  "role":"Deployed",
                  "meshSize":"111mm",
                  "beamLength":"50m",
                  "numBeams":3
               },
               {
                  "type":"SSC",
                  "role":"Deployed",
                  "meshSize":"167mm",
                  "beamLength":"61m",
                  "numBeams":5
               },
               {
                  "type":"GND",
                  "role":"On board",
                  "meshSize":"112mm",
                  "beamLength":"91m",
                  "numBeams":2
               }
            ],
            "lsc":{
               "type":"TAKEN_ONBOARD",
               "unit":1706,
               "weight":677,
               "weight_mean":"WEIGHED"
            },
            "bms":{
               "type":"UNLOADED",
               "unit":85,
               "weight":1691,
               "weight_mean":"WEIGHED"
            },
            "dis":{
               "type":"TAKEN_ONBOARD",
               "unit":1942,
               "weight":993,
               "weight_mean":"STEREOSCOPIC"
            },
            "dim":{
               "type":"LOADED",
               "unit":781,
               "weight":852,
               "weight_mean":"ESTIMATED"
            }
         },
         {
            "locations":[
               {
                  "name":"Setejo",
                  "geometry":"POINT(-100.61887 -59.21938)"
               }
            ],
            "species":"COD",
            "speciesName":"HADDOCK",
            "gears":[
               {
                  "type":"LHM",
                  "role":"Deployed",
                  "meshSize":"77mm",
                  "beamLength":"31m",
                  "numBeams":2
               },
               {
                  "type":"TBB",
                  "role":"Deployed",
                  "meshSize":"196mm",
                  "beamLength":"82m",
                  "numBeams":1
               },
               {
                  "type":"GTR",
                  "role":"Deployed",
                  "meshSize":"230mm",
                  "beamLength":"93m",
                  "numBeams":4
               }
            ],
            "lsc":{
               "type":"DISCARDED",
               "unit":1676,
               "weight":1433,
               "weight_mean":"WEIGHED"
            },
            "bms":{
               "type":"KEPT_IN_NET",
               "unit":1182,
               "weight":1341,
               "weight_mean":"SAMPLING"
            },
            "dis":{
               "type":"ONBOARD",
               "unit":1908,
               "weight":834,
               "weight_mean":"WEIGHED"
            },
            "dim":{
               "type":"ONBOARD",
               "unit":1688,
               "weight":764,
               "weight_mean":"ONBOARD"
            }
         },
         {
            "locations":[
               {
                  "name":"Regoro",
                  "geometry":"POINT(140.02754 -17.3014)"
               },
               {
                  "name":"Luzdonja",
                  "geometry":"POINT(-138.44948 -17.42216)"
               }
            ],
            "species":"SAL",
            "speciesName":"SEAFOOD",
            "gears":[
               {
                  "type":"LHM",
                  "role":"Deployed",
                  "meshSize":"90mm",
                  "beamLength":"91m",
                  "numBeams":1
               },
               {
                  "type":"TBB",
                  "role":"On board",
                  "meshSize":"238mm",
                  "beamLength":"96m",
                  "numBeams":1
               }
            ],
            "lsc":{
               "type":"DISCARDED",
               "unit":1873,
               "weight":1540,
               "weight_mean":"WEIGHED"
            },
            "bms":{
               "type":"TAKEN_ONBOARD",
               "unit":1738,
               "weight":1160,
               "weight_mean":"ONBOARD"
            },
            "dis":{
               "type":"UNLOADED",
               "unit":1200,
               "weight":714,
               "weight_mean":"SAMPLING"
            },
            "dim":{
               "type":"DISCARDED",
               "unit":584,
               "weight":920,
               "weight_mean":"STEREOSCOPIC"
            }
         },
         {
            "locations":[
               {
                  "name":"Keagka",
                  "geometry":"POINT(-176.75727 -85.60281)"
               }
            ],
            "species":"LEM",
            "speciesName":"CODFISH",
            "gears":[
               {
                  "type":"GND",
                  "role":"On board",
                  "meshSize":"137mm",
                  "beamLength":"2m",
                  "numBeams":2
               },
               {
                  "type":"TBB",
                  "role":"On board",
                  "meshSize":"174mm",
                  "beamLength":"6m",
                  "numBeams":1
               }
            ],
            "lsc":{
               "type":"LOADED",
               "unit":470,
               "weight":1015,
               "weight_mean":"WEIGHED"
            },
            "bms":{
               "type":"DISCARDED",
               "unit":336,
               "weight":85,
               "weight_mean":"SAMPLING"
            },
            "dis":{
               "type":"UNLOADED",
               "unit":1542,
               "weight":1246,
               "weight_mean":"SAMPLING"
            },
            "dim":{
               "type":"UNLOADED",
               "unit":827,
               "weight":1493,
               "weight_mean":"ONBOARD"
            }
         },
         {
            "locations":[
               {
                  "name":"Atgube",
                  "geometry":"POINT(10.03929 -85.69628)"
               },
               {
                  "name":"Havomome",
                  "geometry":"POINT(-74.14393 44.41117)"
               },
               {
                  "name":"Poncotaje",
                  "geometry":"POINT(118.4491 -5.65283)"
               }
            ],
            "species":"TUR",
            "speciesName":"GADUS",
            "gears":[
               {
                  "type":"GND",
                  "role":"On board",
                  "meshSize":"212mm",
                  "beamLength":"93m",
                  "numBeams":1
               }
            ],
            "lsc":{
               "type":"DISCARDED",
               "unit":1148,
               "weight":901,
               "weight_mean":"STEREOSCOPIC"
            },
            "bms":{
               "type":"UNLOADED",
               "unit":1352,
               "weight":116,
               "weight_mean":"SAMPLING"
            },
            "dis":{
               "type":"TAKEN_ONBOARD",
               "unit":1914,
               "weight":1926,
               "weight_mean":"WEIGHED"
            },
            "dim":{
               "type":"UNLOADED",
               "unit":480,
               "weight":161,
               "weight_mean":"STEREOSCOPIC"
            }
         }
      ];

    scope.columnOrder = [
				{
					id: 'locations',
					text: 'Locations',
					value: 'name'
				},
				{
					id: 'species',
					text: 'Species'
				},
				{
					id: 'lsc',
					text: 'LSC',
					value: 'weight'
				},
				{
					id: 'bms',
					text: 'BMS',
					value: 'weight'
				},
				{
					id: 'dis',
					text: 'DIS',
					value: 'weight'
				},
				{
					id: 'dim',
					text: 'DIM',
					value: 'weight'
				}
			];

      scope.selectedSpecieLocation = {
        id: 'lsc',
        text: 'LSC',
        value: 'weight'
      };

    var tableChart = compile('<table-chart ng-model="fishingData" columns="columnOrder" selected-item="selectedSpecieLocation"></table-chart>')(scope);
		scope.$digest();

    var isolatedScope = tableChart.isolateScope();

    expect(isolatedScope.mode).toEqual('table');
    expect(isolatedScope.ngModel).toEqual(scope.fishingData);
    expect(isolatedScope.columns).toEqual(scope.columnOrder);
    expect(isolatedScope.selectedItem).toEqual(scope.selectedSpecieLocation);

    expect(angular.element(tableChart).find('.tbody > .tr').length).toEqual(scope.fishingData.length);

    angular.element(tableChart).find('.tbody > .tr')[2].click();
    expect(isolatedScope.ngModel[2].selected).toBe(true);
    expect(isolatedScope.ngModel[2]).toEqual(scope.selectedSpecieLocation);

    angular.element(tableChart).find('.switch-btn').click();

    expect(isolatedScope.mode).toEqual('chart');

    tableChart.isolateScope().$destroy();
  });
});