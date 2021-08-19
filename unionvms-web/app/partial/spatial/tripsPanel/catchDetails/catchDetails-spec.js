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
describe('CatchdetailsCtrl', function () {

	beforeEach(module('unionvmsWeb'));

	var scope, ctrl, activityRestServiceSpy, tripSummaryServiceSpy;

	beforeEach(function () {
		activityRestServiceSpy = jasmine.createSpyObj('activityRestService', [/*'getTripCatchDetail',*/ 'getTripCatchesLandingDetails']);
		tripSummaryServiceSpy = jasmine.createSpyObj('tripSummaryService', ['trip']);

		module(function ($provide) {
			$provide.value('activityRestService', activityRestServiceSpy);
		});
		module(function($provide) {
			$provide.value('tripSummaryService', tripSummaryServiceSpy);
		});
	});

	beforeEach(inject(function ($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({ data: [] });
	}));

	beforeEach(inject(function ($rootScope, $controller) {
		buildMocks();
		scope = $rootScope.$new();
		//scope.tripId = getTripCatchDetail().tripID;
		ctrl = $controller('CatchdetailsCtrl', { $scope: scope });
		scope.$digest();
	}));

	/*function getTripCatchDetail() {
		return {
			"tripID": "BEL-TRP-O16-2016_0021",
			"vesselName": "Beagle(BEL123456789)",
			"departure": "2016-10-21T08:28:21",
			"departureAt": ["BEZEE"],
			"arrival": "2016-10-21T08:28:21",
			"arrivalAt": ["BEOST"],
			"landing": "2016-10-21T08:28:21",
			"landingAt": ["BEOST"]
		};
	}*/



	function getTripCatchesLandingDetails() {
		return {
			"catches": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "30D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 207.99,
								"ANF": 630.01,
								"HKE": 218.5,
								"SQI": 140,
								"JOD": 22,
								"LEZ": 216.01
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "28D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"ANF": 840,
								"SQI": 336,
								"HKE": 321,
								"NEP": 36,
								"LEZ": 72
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "29D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"POK": 26,
								"GFB": 14,
								"ANF": 280,
								"SQI": 28,
								"HKE": 92,
								"LIN": 26,
								"LEZ": 36
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "J"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "33D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"POL": 26,
								"WHG": 78,
								"ANF": 1015,
								"COD": 26,
								"HKE": 11.5,
								"JOD": 22,
								"LEZ": 156
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "J"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "32D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 78,
								"ANF": 175,
								"HKE": 23,
								"LEZ": 36
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "27D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"ANF": 140,
								"SQI": 350,
								"HKE": 126.5,
								"LEZ": 48
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "31D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 338,
								"ANF": 315,
								"COD": 26,
								"SQI": 1260,
								"HKE": 80.5,
								"JOD": 154,
								"LEZ": 240.01
							}
						},
						"summaryFaCatchType": null
					}
				}, {
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "27D9"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"SOL": 13,
								"TUR": 13,
								"GFB": 314,
								"ANF": 545,
								"COD": 26,
								"SQI": 56,
								"HKE": 458,
								"SQC": 13,
								"LIN": 52,
								"JOD": 22,
								"LEZ": 420
							}
						},
						"summaryFaCatchType": null
					}
				}],
				"total": {
					"summaryFishSize": {
						"LSC": {
							"GFB": 328,
							"WHG": 78,
							"HKE": 1331,
							"SQI": 2170,
							"NEP": 36,
							"SQC": 13,
							"JOD": 220,
							"LIN": 78,
							"TUR": 13,
							"SOL": 13,
							"POK": 26,
							"HAD": 623.99,
							"POL": 26,
							"COD": 78,
							"ANF": 3940.01,
							"LEZ": 1224.02
						}
					},
					"summaryFaCatchType": null
				}
			},
			"landing": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					}, {
						"key": "EFFORT_ZONE",
						"value": "B"
					}, {
						"key": "FAO_AREA",
						"value": "27.7.j"
					}, {
						"key": "ICES_STAT_RECTANGLE",
						"value": "27D8"
					}, {
						"key": "TERRITORY",
						"value": "IRL"
					}],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {}
						},
						"summaryFaCatchType": null
					}
				}],
				"total": {
					"summaryFishSize": {
						"LSC": {}
					},
					"summaryFaCatchType": null
				}
			}
		}
	}




	function buildMocks() {
		tripSummaryServiceSpy.trip.id = "";
		/*activityRestServiceSpy.getTripCatchDetail.andCallFake(function () {
			return {
				then: function (callback) {
					return callback(getTripCatchDetail());
				}
			};
		});*/
		activityRestServiceSpy.getTripCatchesLandingDetails.andCallFake(function (test) {
			return {
				then: function (callback) {
					return callback(getTripCatchesLandingDetails());
				}
			};
		});
	}



	it('should call the web services only once', inject(function () {
		//expect(activityRestServiceSpy.getTripCatchDetail.callCount).toBe(1);
		expect(activityRestServiceSpy.getTripCatchesLandingDetails.callCount).toBe(1);
	}));

	it('should initialize the mandatory properties', inject(function () {
		angular.forEach(scope.tables, function (table) {
			expect(table.headers).toBeDefined();
			expect(table.rows).toBeDefined();
			expect(table.order).toBeDefined();
		});
	}));

	it('should initialize the totals and table titles', inject(function () {
		var tableData = getTripCatchesLandingDetails();

		angular.forEach(tableData, function (data, tableName) {
			angular.forEach(scope.tables, function (table) {
				if (tableName === table.title) {
					if (angular.isDefined(data.total)) {
						expect(table.totals).toBeDefined();
					}
					if (tableName === 'difference') {
						expect(table.title).toBeUndefined();
					} else {
						expect(table.title).toEqual(tableName);
					}
				}
			});
		});
	}));


});

